package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditTransaction; // ADDED
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class CreditCardService {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private CreditAccountRepository creditAccountRepository;
    
    @Autowired // ADDED
    private CreditTransactionService creditTransactionService; // ADDED

    // Activate card
    @Transactional
    public CreditCard activateCard(Long cardId, String pin) {
        CreditCard card = getCard(cardId);
        
        if (!"INACTIVE".equals(card.getStatus())) {
            throw new RuntimeException("Card is not in INACTIVE state");
        }

        if (pin == null || pin.length() != 4 || !pin.matches("\\d+")) {
            throw new RuntimeException("PIN must be 4 digits");
        }

        // In production, hash the PIN
        card.setPinHash(pin);
        card.setStatus("ACTIVE");
        card.setFailedPinAttempts(0);
        card.setIsLocked(false);

        return creditCardRepository.save(card);
    }

    // Get card by ID
    public CreditCard getCard(Long id) {
        return creditCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit card not found"));
    }

    // Get card by card number
    public CreditCard getCardByNumber(String cardNumber) {
        return creditCardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Credit card not found"));
    }

    // Get all cards for an account
    public List<CreditCard> getAccountCards(Long accountId) {
        return creditCardRepository.findByCreditAccountId(accountId);
    }

    // Freeze card
    @Transactional
    public CreditCard freezeCard(Long cardId, String reason) {
        CreditCard card = getCard(cardId);
        
        if (!card.isActive()) {
            throw new RuntimeException("Card is not active");
        }

        card.setStatus("FROZEN");
        card.setFrozenDate(LocalDateTime.now());
        card.setIsLocked(true);

        return creditCardRepository.save(card);
    }

    // Unfreeze card
    @Transactional
    public CreditCard unfreezeCard(Long cardId) {
        CreditCard card = getCard(cardId);
        
        if (!"FROZEN".equals(card.getStatus())) {
            throw new RuntimeException("Card is not frozen");
        }

        card.setStatus("ACTIVE");
        card.setFrozenDate(null);
        card.setIsLocked(false);
        card.setFailedPinAttempts(0);

        return creditCardRepository.save(card);
    }

    // Change PIN
    @Transactional
    public CreditCard changePin(Long cardId, String oldPin, String newPin) {
        CreditCard card = getCard(cardId);
        
        if (!card.isActive()) {
            throw new RuntimeException("Card is not active");
        }

        // Verify old PIN (in production, compare hashes)
        if (!oldPin.equals(card.getPinHash())) {
            card.incrementFailedPinAttempts();
            creditCardRepository.save(card);
            throw new RuntimeException("Invalid PIN");
        }

        if (newPin == null || newPin.length() != 4 || !newPin.matches("\\d+")) {
            throw new RuntimeException("New PIN must be 4 digits");
        }

        // Reset failed attempts on successful PIN change
        card.setPinHash(newPin);
        card.setFailedPinAttempts(0);
        card.setIsLocked(false);

        return creditCardRepository.save(card);
    }

    // Verify PIN (for transactions)
    @Transactional
    public boolean verifyPin(Long cardId, String pin) {
        CreditCard card = getCard(cardId);
        
        if (card.getIsLocked()) {
            if (card.getLockedUntil() != null && card.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Card is locked. Try again later.");
            } else {
                // Unlock if lock period expired
                card.setIsLocked(false);
                card.setFailedPinAttempts(0);
                card.setLockedUntil(null);
                creditCardRepository.save(card);
            }
        }

        // Verify PIN (in production, compare hashes)
        if (pin.equals(card.getPinHash())) {
            card.resetFailedPinAttempts();
            creditCardRepository.save(card);
            return true;
        } else {
            card.incrementFailedPinAttempts();
            creditCardRepository.save(card);
            
            if (card.getFailedPinAttempts() >= 3) {
                card.setIsLocked(true);
                card.setStatus("FROZEN");
                card.setFrozenDate(LocalDateTime.now());
                creditCardRepository.save(card);
                throw new RuntimeException("Card locked after 3 failed PIN attempts");
            }
            return false;
        }
    }

    // Make purchase - UPDATED to use transaction service
    @Transactional
    public CreditCard makePurchase(Long cardId, Double amount, String merchant) {
        CreditCard card = getCard(cardId);
        
        if (!card.isActive()) {
            throw new RuntimeException("Card is not active");
        }

        if (!card.canMakePurchase(amount)) {
            throw new RuntimeException("Insufficient credit available");
        }

        // Record the purchase transaction (this updates balances automatically)
        CreditTransaction transaction = creditTransactionService.recordPurchase(
            cardId, 
            amount, 
            merchant, 
            "PURCHASE" // or determine category based on merchant
        );
        
        // Get the updated account from the transaction
        CreditAccount account = transaction.getCreditAccount();
        
        // Update the card with the new balances from the account
        card.setCurrentBalance(account.getCurrentBalance());
        card.setAvailableCredit(account.getAvailableCredit());

        return creditCardRepository.save(card);
    }

    // Replace lost/stolen card
    @Transactional
    public CreditCard replaceCard(Long cardId, String reason) {
        CreditCard oldCard = getCard(cardId);
        CreditAccount account = oldCard.getCreditAccount();
        User user = account.getUser();

        // Mark old card as replaced
        oldCard.setStatus("REPLACED");
        oldCard.setReplacedDate(LocalDateTime.now());
        oldCard.setReplacementReason(reason);
        creditCardRepository.save(oldCard);

        // Create new card
        CreditCard newCard = new CreditCard(account, user.getFullName(), oldCard.getCardType());
        newCard.setCardNumber(generateCardNumber());
        newCard.setExpiryDate(generateExpiryDate());
        newCard.setCvv(generateCVV());
        newCard.setPinHash(oldCard.getPinHash()); // Keep same PIN or require new one
        newCard.setStatus("INACTIVE");
        newCard.setCreditLimit(account.getCreditLimit());
        newCard.setAvailableCredit(account.getAvailableCredit());
        newCard.setCurrentBalance(account.getCurrentBalance());
        newCard.setForeignTransactionFee(oldCard.getForeignTransactionFee());
        newCard.setCashAdvanceLimit(oldCard.getCashAdvanceLimit());
        newCard.setCashAdvanceAvailable(oldCard.getCashAdvanceAvailable());
        newCard.setCashAdvanceFee(oldCard.getCashAdvanceFee());
        newCard.setRewardType(oldCard.getRewardType());
        newCard.setRewardPoints(oldCard.getRewardPoints());
        newCard.setDesignColor(oldCard.getDesignColor());
        newCard.setReplacedByCardId(oldCard.getId());

        return creditCardRepository.save(newCard);
    }

    // Get cards expiring soon
    public List<CreditCard> getCardsExpiringSoon() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(3);
        return creditCardRepository.findCardsExpiringBetween(startDate, endDate);
    }

    // Get expired cards
    public List<CreditCard> getExpiredCards() {
        return creditCardRepository.findExpiredCards(LocalDate.now());
    }

    // Generate card number
    private String generateCardNumber() {
        return String.format("%04d-%04d-%04d-%04d",
                new Random().nextInt(10000),
                new Random().nextInt(10000),
                new Random().nextInt(10000),
                new Random().nextInt(10000));
    }

    // Generate expiry date (3 years from now)
    private LocalDate generateExpiryDate() {
        return LocalDate.now().plusYears(3);
    }

    // Generate CVV
    private String generateCVV() {
        return String.format("%03d", new Random().nextInt(1000));
    }

    // Get all cards (for admin)
    public List<CreditCard> getAllCards() {
    return creditCardRepository.findAll();
  }

    // Get card statistics for admin
    public CardStatistics getCardStatistics() {
        CardStatistics stats = new CardStatistics();
        
        stats.setTotalCards(creditCardRepository.count());
        stats.setActiveCards(creditCardRepository.findByStatus("ACTIVE").size());
        stats.setInactiveCards(creditCardRepository.findByStatus("INACTIVE").size());
        stats.setFrozenCards(creditCardRepository.findByStatus("FROZEN").size());
        stats.setExpiredCards(creditCardRepository.findByStatus("EXPIRED").size());
        stats.setReplacedCards(creditCardRepository.findByStatus("REPLACED").size());
        
        return stats;
    }

    // Inner class for statistics
    public static class CardStatistics {
        private long totalCards;
        private long activeCards;
        private long inactiveCards;
        private long frozenCards;
        private long expiredCards;
        private long replacedCards;

        // Getters and setters
        public long getTotalCards() { return totalCards; }
        public void setTotalCards(long totalCards) { this.totalCards = totalCards; }

        public long getActiveCards() { return activeCards; }
        public void setActiveCards(long activeCards) { this.activeCards = activeCards; }

        public long getInactiveCards() { return inactiveCards; }
        public void setInactiveCards(long inactiveCards) { this.inactiveCards = inactiveCards; }

        public long getFrozenCards() { return frozenCards; }
        public void setFrozenCards(long frozenCards) { this.frozenCards = frozenCards; }

        public long getExpiredCards() { return expiredCards; }
        public void setExpiredCards(long expiredCards) { this.expiredCards = expiredCards; }

        public long getReplacedCards() { return replacedCards; }
        public void setReplacedCards(long replacedCards) { this.replacedCards = replacedCards; }
    }
}
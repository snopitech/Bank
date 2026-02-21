package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.*;
import com.snopitech.snopitechbank.model.Card;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private AccountRepository accountRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    // ==================== CARD GENERATION ====================

    /**
     * Generate a new card automatically when a checking account is created
     */
    @Transactional
    public Card generateCardForAccount(Account account, String cardType) {
        // Generate unique card number
        String cardNumber = generateCardNumber();
        
        // Generate CVV
        String cvv = generateCVV();
        
        // Set expiry date (3 years from now)
        LocalDate expiryDate = LocalDate.now().plusYears(3);
        
        // Create card
        Card card = new Card();
        card.setAccount(account);
        card.setCardNumber(cardNumber);
        card.setCardHolderName(account.getOwnerName());
        card.setCardType(cardType);
        card.setExpiryDate(expiryDate);
        card.setCvv(passwordEncoder.encode(cvv)); // Store hashed CVV
        card.setIsVirtual("VIRTUAL".equals(cardType));
        card.setStatus("INACTIVE"); // Needs activation
        card.setDailyLimit(1000.0); // Default daily limit
        card.setTransactionLimit(500.0); // Default per transaction
        card.setMonthlyLimit(5000.0); // Default monthly limit
        
        // Set a temporary PIN hash for inactive cards (will be changed during activation)
        // Using a placeholder that won't match any actual PIN
        card.setPinHash(passwordEncoder.encode("0000"));
        
        // For physical cards, set default design
        if ("PHYSICAL".equals(cardType)) {
            card.setDesignColor("#1E3A8A"); // Default blue
        }
        
        return cardRepository.save(card);
    }

    /**
     * Generate a unique 16-digit card number
     */
    private String generateCardNumber() {
        // BIN (Bank Identification Number) - 6 digits
        String bin = "516920"; // Snopitech BIN
        
        // Generate 9 random digits
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 9; i++) {
            sb.append(random.nextInt(10));
        }
        
        // Combine and calculate Luhn checksum
        String withoutChecksum = bin + sb.toString();
        int checksum = calculateLuhnChecksum(withoutChecksum);
        
        return withoutChecksum + checksum;
    }

    /**
     * Calculate Luhn algorithm checksum digit
     */
    private int calculateLuhnChecksum(String number) {
        int sum = 0;
        boolean alternate = true;
        
        for (int i = number.length() - 1; i >= 0; i--) {
            int digit = Integer.parseInt(number.substring(i, i + 1));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + 1;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return (sum * 9) % 10;
    }

    /**
     * Generate 3-digit CVV
     */
    private String generateCVV() {
        return String.format("%03d", random.nextInt(1000));
    }

    // ==================== CARD MANAGEMENT ====================

    /**
     * Get all cards for a user
     */
    public List<CardDTO> getCardsByUser(Long userId) {
        List<Card> cards = cardRepository.findByUserId(userId);
        return cards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all cards for an account
     */
    public List<CardDTO> getCardsByAccount(Long accountId) {
        List<Card> cards = cardRepository.findByAccountId(accountId);
        return cards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get card by ID
     */
    public CardDTO getCardById(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        return convertToDTO(card);
    }

    /**
     * Get active cards for a user
     */
    public List<CardDTO> getActiveCardsByUser(Long userId) {
        List<Card> cards = cardRepository.findActiveCardsByUserId(userId);
        return cards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find expired cards
     */
    public List<CardDTO> findExpiredCards() {
        List<Card> cards = cardRepository.findExpiredCards(LocalDate.now());
        return cards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find cards expiring soon (next 30 days)
     */
    public List<CardDTO> findCardsExpiringSoon() {
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<Card> cards = cardRepository.findCardsExpiringSoon(today, thirtyDaysFromNow);
        return cards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Activate a card
     */
    @Transactional
    public CardDTO activateCard(Long cardId, String pin) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        if (!"INACTIVE".equals(card.getStatus())) {
            throw new RuntimeException("Card cannot be activated - current status: " + card.getStatus());
        }
        
        // Set PIN
        card.setPinHash(passwordEncoder.encode(pin));
        card.setStatus("ACTIVE");
        
        Card updatedCard = cardRepository.save(card);
        return convertToDTO(updatedCard);
    }

    /**
     * Update card status (freeze/unfreeze/block)
     */
    @Transactional
    public CardDTO updateCardStatus(Long cardId, UpdateCardStatusRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        String newStatus = request.getStatus();
        
        // Validate status transition
        validateStatusTransition(card.getStatus(), newStatus);
        
        card.setStatus(newStatus);
        
        // Set additional fields based on status
        if ("FROZEN".equals(newStatus)) {
            card.setFrozenDate(LocalDateTime.now());
        }
        
        Card updatedCard = cardRepository.save(card);
        return convertToDTO(updatedCard);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Add validation logic for allowed status transitions
        if ("CANCELLED".equals(currentStatus) || "REPLACED".equals(currentStatus)) {
            throw new RuntimeException("Cannot change status of a " + currentStatus + " card");
        }
    }

    /**
     * Change card PIN
     */
    @Transactional
    public CardDTO changePin(Long cardId, UpdatePinRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        // Verify card is active
        if (!"ACTIVE".equals(card.getStatus())) {
            throw new RuntimeException("Cannot change PIN on a " + card.getStatus() + " card");
        }
        
        // Verify current PIN
        if (!passwordEncoder.matches(request.getCurrentPin(), card.getPinHash())) {
            card.incrementFailedPinAttempts();
            cardRepository.save(card);
            throw new RuntimeException("Current PIN is incorrect");
        }
        
        // Verify new PIN matches confirmation
        if (!request.isNewPinMatching()) {
            throw new RuntimeException("New PIN and confirm PIN do not match");
        }
        
        // Reset failed attempts and update PIN
        card.resetFailedPinAttempts();
        card.setPinHash(passwordEncoder.encode(request.getNewPin()));
        
        Card updatedCard = cardRepository.save(card);
        return convertToDTO(updatedCard);
    }

    /**
     * Request card replacement
     */
    @Transactional
    public CardDTO replaceCard(Long cardId, ReplaceCardRequest request) {
        Card oldCard = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        // Mark old card as replaced
        oldCard.setStatus("REPLACED");
        oldCard.setReplacedDate(LocalDateTime.now());
        oldCard.setReplacementReason(request.getReason());
        cardRepository.save(oldCard);
        
        // Generate new card
        Card newCard = generateCardForAccount(oldCard.getAccount(), oldCard.getCardType());
        newCard.setReplacedByCardId(oldCard.getId());
        
        // Apply any design preferences from old card
        newCard.setDesignColor(oldCard.getDesignColor());
        
        Card savedNewCard = cardRepository.save(newCard);
        return convertToDTO(savedNewCard);
    }

    /**
     * Update card spending limits
     */
    @Transactional
    public CardDTO updateCardLimits(Long cardId, UpdateCardLimitsRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        if (request.getDailyLimit() != null) {
            card.setDailyLimit(request.getDailyLimit());
        }
        if (request.getTransactionLimit() != null) {
            card.setTransactionLimit(request.getTransactionLimit());
        }
        if (request.getMonthlyLimit() != null) {
            card.setMonthlyLimit(request.getMonthlyLimit());
        }
        
        Card updatedCard = cardRepository.save(card);
        return convertToDTO(updatedCard);
    }

    /**
     * Get card limits
     */
    public CardDTO getCardLimits(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        return convertToDTO(card);
    }

    /**
     * Update card design
     */
    @Transactional
    public CardDTO updateCardDesign(Long cardId, CardDesignRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        if (!request.hasDesignChanges()) {
            throw new RuntimeException("No design changes provided");
        }
        
        if (request.getDesignColor() != null) {
            card.setDesignColor(request.getDesignColor());
        }
        
        if (request.getDesignImage() != null) {
            card.setDesignImage(request.getDesignImage());
        }
        
        Card updatedCard = cardRepository.save(card);
        return convertToDTO(updatedCard);
    }

    /**
     * Verify card for deposit/withdrawal (with CVV and PIN)
     */
    public boolean verifyCard(String cardNumber, String cvv, String pin) {
        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        // Check if card is active
        if (!card.isActive()) {
            throw new RuntimeException("Card is not active - status: " + card.getStatus());
        }
        
        // Verify CVV
        if (!passwordEncoder.matches(cvv, card.getCvv())) {
            throw new RuntimeException("Invalid CVV");
        }
        
        // Verify PIN
        if (!passwordEncoder.matches(pin, card.getPinHash())) {
            card.incrementFailedPinAttempts();
            cardRepository.save(card);
            throw new RuntimeException("Invalid PIN");
        }
        
        // Reset failed attempts on successful verification
        card.resetFailedPinAttempts();
        card.setLastUsedDate(LocalDateTime.now());
        cardRepository.save(card);
        
        return true;
    }

    // ==================== NEW ZIP CODE VERIFICATION METHOD ====================

    /**
     * Verify card using ZIP code only (no CVV required)
     * This allows users to make purchases by entering their billing ZIP code
     */
    public boolean verifyCardWithZip(String cardNumber, String zipCode) {
        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        // Check if card is active
        if (!card.isActive()) {
            throw new RuntimeException("Card is not active - status: " + card.getStatus());
        }
        
        // Get the account and user to access zip code
        Account account = card.getAccount();
        User user = account.getUser();
        
        if (user == null) {
            throw new RuntimeException("User not found for this card");
        }
        
        String accountZipCode = user.getZipCode();
        
        if (accountZipCode == null || accountZipCode.isEmpty()) {
            throw new RuntimeException("No ZIP code associated with this account");
        }
        
        // Clean and compare ZIP codes (remove spaces and dashes)
        String cleanInputZip = zipCode.replaceAll("[\\s-]", "");
        String cleanAccountZip = accountZipCode.replaceAll("[\\s-]", "");
        
        if (!cleanAccountZip.equals(cleanInputZip)) {
            // Track failed attempts (reuse PIN attempt counter for simplicity)
            card.incrementFailedPinAttempts();
            cardRepository.save(card);
            
            throw new RuntimeException("Invalid ZIP code");
        }
        
        // Reset failed attempts on successful verification
        card.resetFailedPinAttempts();
        card.setLastUsedDate(LocalDateTime.now());
        cardRepository.save(card);
        
        return true;
    }

    // ==================== HELPER METHODS ====================

    /**
     * Convert Card entity to DTO
     */
    private CardDTO convertToDTO(Card card) {
        return new CardDTO(
            card.getId(),
            card.getAccount().getId(),
            card.getCardNumber(),
            card.getCardHolderName(),
            card.getCardType(),
            card.getExpiryDate(),
            card.getStatus(),
            card.getIsVirtual(),
            card.getDesignColor(),
            card.getDesignImage(),
            card.getIssuedDate(),
            card.getLastUsedDate(),
            card.getDailyLimit(),
            card.getTransactionLimit(),
            card.getMonthlyLimit(),
            card.getIsLocked(),
            card.getFailedPinAttempts(),
            card.isActive(),
            card.isExpired()
        );
    }
}
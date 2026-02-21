package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Card;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.service.TransactionService;
import com.snopitech.snopitechbank.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card-payments")
public class CardPaymentController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AccountService accountService;

    /**
     * POST /api/card-payments/pay
     * Process a payment using card number + ZIP code
     * 
     * Request body:
     * {
     *   "cardNumber": "5169209407306581",
     *   "zipCode": "21054",
     *   "amount": 50.00,
     *   "recipientAccountNumber": "5829242213",
     *   "description": "Dinner payment"
     * }
     */
    @PostMapping("/pay")
    public ResponseEntity<?> processCardPayment(@RequestBody Map<String, Object> request) {
        try {
            // Extract request data
            String cardNumber = (String) request.get("cardNumber");
            String zipCode = (String) request.get("zipCode");
            Double amount = request.containsKey("amount") 
                ? Double.valueOf(request.get("amount").toString()) 
                : null;
            String recipientAccountNumber = (String) request.get("recipientAccountNumber");
            String description = (String) request.get("description");

            // Validate required fields
            if (cardNumber == null || cardNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Card number is required"));
            }
            if (zipCode == null || zipCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ZIP code is required"));
            }
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid amount is required"));
            }
            if (recipientAccountNumber == null || recipientAccountNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Recipient account number is required"));
            }

            // Find the card
            Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));

            // Check if card is active
            if (!card.isActive()) {
                throw new RuntimeException("Card is not active - status: " + card.getStatus());
            }

            // Get the cardholder's account (source account)
            Account sourceAccount = card.getAccount();
            
            // Get the account's user to verify ZIP code
            User user = sourceAccount.getUser();
            if (user == null) {
                throw new RuntimeException("User not found for this card");
            }

            // Verify ZIP code
            String accountZipCode = user.getZipCode();
            if (accountZipCode == null || accountZipCode.isEmpty()) {
                throw new RuntimeException("No ZIP code associated with this account");
            }

            String cleanInputZip = zipCode.replaceAll("[\\s-]", "");
            String cleanAccountZip = accountZipCode.replaceAll("[\\s-]", "");
            
            if (!cleanAccountZip.equals(cleanInputZip)) {
                // Track failed attempt
                card.incrementFailedPinAttempts();
                cardRepository.save(card);
                
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Invalid ZIP code",
                    "remainingAttempts", 3 - card.getFailedPinAttempts()
                ));
            }

            // Reset failed attempts on successful verification
            card.resetFailedPinAttempts();
            card.setLastUsedDate(LocalDateTime.now());
            cardRepository.save(card);

            // Find recipient account
            Account recipientAccount = accountRepository.findByAccountNumber(recipientAccountNumber);
            if (recipientAccount == null) {
                throw new RuntimeException("Recipient account not found");
            }

            // Check if source account has sufficient funds
            if (sourceAccount.getBalance() < amount) {
                throw new RuntimeException("Insufficient funds");
            }

            // Perform the transfer using existing account service
            // This automatically creates the necessary transactions
            Account updatedSource = accountService.transfer(
                sourceAccount.getId(), 
                recipientAccount.getId(), 
                amount
            );

            // Build response - using string concatenation for masked numbers
            String fromAccountMasked = "****" + sourceAccount.getAccountNumber()
                .substring(Math.max(0, sourceAccount.getAccountNumber().length() - 4));
            
            String toAccountMasked = "****" + recipientAccount.getAccountNumber()
                .substring(Math.max(0, recipientAccount.getAccountNumber().length() - 4));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("amount", amount);
            response.put("fromAccount", fromAccountMasked);
            response.put("fromAccountId", sourceAccount.getId());
            response.put("fromCard", card.getMaskedCardNumber());
            response.put("fromName", sourceAccount.getOwnerName());
            response.put("toAccount", toAccountMasked);
            response.put("toAccountId", recipientAccount.getId());
            response.put("toName", recipientAccount.getOwnerName());
            response.put("newBalance", updatedSource.getBalance());
            response.put("timestamp", LocalDateTime.now());
            response.put("description", description);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    /**
     * GET /api/card-payments/card-info
     * Get public card info by card number (masked)
     */
    @GetMapping("/card-info")
    public ResponseEntity<?> getCardInfo(@RequestParam String cardNumber) {
        try {
            Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));

            Account account = card.getAccount();

            Map<String, Object> cardInfo = new HashMap<>();
            cardInfo.put("maskedCardNumber", card.getMaskedCardNumber());
            cardInfo.put("cardHolderName", card.getCardHolderName());
            cardInfo.put("cardType", card.getCardType());
            cardInfo.put("status", card.getStatus());
            cardInfo.put("isActive", card.isActive());
            cardInfo.put("accountId", account.getId());

            return ResponseEntity.ok(cardInfo);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/card-payments/transactions
     * Get transactions made with a specific card
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getCardTransactions(@RequestParam String cardNumber) {
        try {
            Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));

            Account account = card.getAccount();
            
            // Get all transactions for this account
            List<TransactionDTO> transactions = transactionService.getTransactionsByAccountId(account.getId());

            return ResponseEntity.ok(Map.of(
                "cardNumber", card.getMaskedCardNumber(),
                "transactions", transactions
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
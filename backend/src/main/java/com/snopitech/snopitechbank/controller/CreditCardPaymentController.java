package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.service.TransactionService;
import com.snopitech.snopitechbank.service.CreditTransactionService;
import com.snopitech.snopitechbank.service.CreditAccountServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/credit-card-payments")
public class CreditCardPaymentController {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private AccountRepository accountRepository;

    @SuppressWarnings("unused")
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CreditTransactionService creditTransactionService;
    
    @Autowired
    private CreditAccountServiceImpl creditAccountServiceImpl;

    /**
     * POST /api/credit-card-payments/pay
     * Process a payment using credit card number + ZIP code
     * Sends money FROM credit card TO any account
     */
    @PostMapping("/pay")
    public ResponseEntity<?> processCreditCardPayment(@RequestBody Map<String, Object> request) {
            System.out.println("🔥🔥🔥 CREDIT CARD PAYMENT CONTROLLER HIT 🔥🔥🔥"); //debug
        try {
            // Extract request data
            String cardNumber = (String) request.get("cardNumber");
            String zipCode = (String) request.get("zipCode");
            Double amount = request.containsKey("amount") 
                ? Double.valueOf(request.get("amount").toString()) 
                : null;
            String recipientAccountNumber = (String) request.get("recipientAccountNumber");
            String description = (String) request.get("description");

            // Log the incoming request
            System.out.println("=== CREDIT CARD PAYMENT REQUEST ===");
            System.out.println("Card Number: " + cardNumber);
            System.out.println("ZIP Code: " + zipCode);
            System.out.println("Amount: " + amount);
            System.out.println("Recipient: " + recipientAccountNumber);
            System.out.println("Description: " + description);

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

            // Clean the card number (remove dashes and spaces)
            String cleanCardNumber = cardNumber.replaceAll("[\\s-]", "");
            System.out.println("Cleaned card number: " + cleanCardNumber);

            // Find credit card
            Optional<CreditCard> creditCardOpt = creditCardRepository.findByCleanCardNumber(cleanCardNumber);

            if (creditCardOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Credit card not found with number: " + cleanCardNumber
                ));
            }

            CreditCard creditCard = creditCardOpt.get();
            System.out.println("Credit card found: ID=" + creditCard.getId() + ", Type=" + creditCard.getCardType());
            
            // Check if card is active
            if (!"ACTIVE".equals(creditCard.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Card is not active - status: " + creditCard.getStatus()
                ));
            }

            // Verify ZIP code
            User user = creditCard.getCreditAccount().getUser();
            String accountZipCode = user.getZipCode();
            if (accountZipCode == null || accountZipCode.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "No ZIP code associated with this account"
                ));
            }

            String cleanInputZip = zipCode.replaceAll("[\\s-]", "");
            String cleanAccountZip = accountZipCode.replaceAll("[\\s-]", "");
            
            if (!cleanAccountZip.equals(cleanInputZip)) {
                // Credit cards don't have PIN attempts, but we'll log the failed attempt
                System.out.println("Invalid ZIP code attempt for credit card ID: " + creditCard.getId());
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Invalid ZIP code"
                ));
            }

            CreditAccount creditAccount = creditCard.getCreditAccount();

            // Check available credit
            if (creditAccount.getAvailableCredit() < amount) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Insufficient credit available",
                    "availableCredit", creditAccount.getAvailableCredit()
                ));
            }

            // Find recipient account
            Account recipientAccount = accountRepository.findByAccountNumber(recipientAccountNumber);
            if (recipientAccount == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Recipient account not found: " + recipientAccountNumber
                ));
            }

            // REMOVED: Duplicate balance update - now handled by recordTransfer
            
            // Update recipient account balance
            double newRecipientBalance = recipientAccount.getBalance() + amount;
            recipientAccount.setBalance(newRecipientBalance);
            accountRepository.save(recipientAccount);
            
            // Update card last used date
            creditCard.setLastUsedDate(LocalDateTime.now());
            creditCardRepository.save(creditCard);

            // ===== CREATE CREDIT TRANSACTION RECORD FOR SENDER (with CDC indicator) =====
            String recipientName = recipientAccount.getOwnerName();
            @SuppressWarnings("unused")
            String recipientDisplayNumber = recipientAccountNumber.length() > 4 ? 
                recipientAccountNumber.substring(recipientAccountNumber.length() - 4) : 
                recipientAccountNumber;

            creditTransactionService.recordTransfer(
                creditAccount.getId(),
                amount,
                recipientName,
                recipientAccountNumber,
                description != null ? description : "Card transfer"
            );

            
// ===== CREATE TRANSACTION RECORD FOR RECIPIENT =====
TransactionDTO recipientTx = new TransactionDTO();
recipientTx.setAccountId(recipientAccount.getId());
recipientTx.setAmount(amount);
recipientTx.setType("DEPOSIT");
recipientTx.setDescription(description != null ? 
    description + " (from credit card)" : 
    "Received from credit card");
recipientTx.setTimestamp(LocalDateTime.now());
// recipientTx.setTargetAccountId(creditAccount.getId()); ← REMOVED
transactionService.createTransaction(recipientTx);
            
            
            System.out.println("Credit card payment of " + amount + " processed successfully");
            System.out.println("Recipient " + recipientAccountNumber + " credited with " + amount);

            String fromAccountMasked = creditAccount.getMaskedAccountNumber();
            String toAccountMasked = "****" + recipientAccount.getAccountNumber()
                .substring(Math.max(0, recipientAccount.getAccountNumber().length() - 4));

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Credit card payment processed successfully");
            response.put("amount", amount);
            response.put("fromAccount", fromAccountMasked);
            response.put("fromAccountId", creditAccount.getId());
            response.put("fromCard", creditCard.getMaskedCardNumber());
            response.put("fromName", user.getFullName());
            response.put("cardType", "CREDIT");
            response.put("toAccount", toAccountMasked);
            response.put("toAccountId", recipientAccount.getId());
            response.put("toName", recipientAccount.getOwnerName());
            response.put("newBalance", creditAccount.getCurrentBalance());
            response.put("timestamp", LocalDateTime.now());
            response.put("description", description);

            System.out.println("=== CREDIT CARD PAYMENT COMPLETED SUCCESSFULLY ===");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("=== CREDIT CARD PAYMENT FAILED ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
    
    /**
     * POST /api/credit-card-payments/payoff
     * Pay off credit card FROM another account (savings/checking/business)
     */
    @PostMapping("/payoff")
    public ResponseEntity<?> payOffCreditCard(@RequestBody Map<String, Object> request) {
        System.out.println("🔥🔥🔥 CREDIT CARD PAYOFF CONTROLLER HIT 🔥🔥🔥");
        try {
            // Extract request data
            String cardNumber = (String) request.get("cardNumber");
            String zipCode = (String) request.get("zipCode");
            Double amount = request.containsKey("amount") 
                ? Double.valueOf(request.get("amount").toString()) 
                : null;
            String sourceAccountNumber = (String) request.get("sourceAccountNumber");
            String description = (String) request.get("description");

            // Log the incoming request
            System.out.println("=== CREDIT CARD PAYOFF REQUEST ===");
            System.out.println("Card Number: " + cardNumber);
            System.out.println("ZIP Code: " + zipCode);
            System.out.println("Amount: " + amount);
            System.out.println("Source Account: " + sourceAccountNumber);
            System.out.println("Description: " + description);

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
            if (sourceAccountNumber == null || sourceAccountNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Source account number is required"));
            }

            // Clean the card number
            String cleanCardNumber = cardNumber.replaceAll("[\\s-]", "");
            
            // Find credit card
            Optional<CreditCard> creditCardOpt = creditCardRepository.findByCleanCardNumber(cleanCardNumber);
            if (creditCardOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Credit card not found"));
            }

            CreditCard creditCard = creditCardOpt.get();
            
            // Check if card is active
            if (!"ACTIVE".equals(creditCard.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Card is not active"));
            }

            // Verify ZIP code
            User user = creditCard.getCreditAccount().getUser();
            String accountZipCode = user.getZipCode();
            String cleanInputZip = zipCode.replaceAll("[\\s-]", "");
            String cleanAccountZip = accountZipCode.replaceAll("[\\s-]", "");
            
            if (!cleanAccountZip.equals(cleanInputZip)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid ZIP code"));
            }

            // Find source account
            Account sourceAccount = accountRepository.findByAccountNumber(sourceAccountNumber);
            if (sourceAccount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Source account not found"));
            }

            // Use the payCreditCard method from CreditAccountServiceImpl
            CreditAccount updatedAccount = creditAccountServiceImpl.payCreditCard(
                creditCard.getCreditAccount().getId(),
                sourceAccount.getId(),
                amount,
                description
            );

            String fromAccountMasked = "****" + sourceAccount.getAccountNumber()
                .substring(Math.max(0, sourceAccount.getAccountNumber().length() - 4));
            String toCardMasked = creditCard.getMaskedCardNumber();

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Credit card paid off successfully");
            response.put("amount", amount);
            response.put("fromAccount", fromAccountMasked);
            response.put("fromAccountId", sourceAccount.getId());
            response.put("fromName", sourceAccount.getOwnerName());
            response.put("toCard", toCardMasked);
            response.put("newBalance", updatedAccount.getCurrentBalance());
            response.put("timestamp", LocalDateTime.now());
            response.put("description", description);

            System.out.println("=== CREDIT CARD PAYOFF COMPLETED SUCCESSFULLY ===");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("=== CREDIT CARD PAYOFF FAILED ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
}
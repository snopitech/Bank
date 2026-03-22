package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Card;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.service.TransactionService;
import com.snopitech.snopitechbank.service.AccountService;
import com.snopitech.snopitechbank.service.CreditAccountService;
import com.snopitech.snopitechbank.service.CreditTransactionService;
import com.snopitech.snopitechbank.service.CreditAccountServiceImpl; // ADD THIS
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/card-payments")
public class CardPaymentController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AccountService accountService;

    @SuppressWarnings("unused")
    @Autowired
    private CreditAccountService creditAccountService;

    @SuppressWarnings("unused")
    @Autowired
    private CreditTransactionService creditTransactionService;
    
    @Autowired // ADD THIS
    private CreditAccountServiceImpl creditAccountServiceImpl; // ADD THIS

    /**
     * POST /api/card-payments/pay
     * Process a payment using card number + ZIP code
     * Supports both debit and credit cards
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

            // Log the incoming request
            System.out.println("=== PAYMENT REQUEST ===");
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

            // Try to find as debit card first
            Optional<Card> debitCardOpt = cardRepository.findByCleanCardNumber(cleanCardNumber);
            
            // Try to find as credit card if not found as debit
            Optional<CreditCard> creditCardOpt = debitCardOpt.isEmpty() ? 
                creditCardRepository.findByCleanCardNumber(cleanCardNumber) : Optional.empty();

            if (debitCardOpt.isEmpty() && creditCardOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Card not found with number: " + cleanCardNumber
                ));
            }

            User user = null;
            String cardType = "";
            @SuppressWarnings("unused")
            String cardHolderName = "";
            String maskedCardNumber = "";
            String fromName = "";
            String fromAccountMasked = "";
            Long fromAccountId = null;
            Double newBalance = null;
            boolean isCredit = creditCardOpt.isPresent();

            // Find recipient account (may be null for deleted/test accounts)
            Account recipientAccount = accountRepository.findByAccountNumber(recipientAccountNumber);

            if (isCredit) {
                // Handle credit card payment - USING THE NEW SERVICE
                CreditCard creditCard = creditCardOpt.get();
                System.out.println("Credit card found: ID=" + creditCard.getId() + ", Type=" + creditCard.getCardType());
                
                // Check if card is active
                if (!"ACTIVE".equals(creditCard.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Card is not active - status: " + creditCard.getStatus()
                    ));
                }

                CreditAccount creditAccount = creditCard.getCreditAccount();
                user = creditAccount.getUser();
                cardType = "CREDIT";
                cardHolderName = creditCard.getCardHolderName();
                maskedCardNumber = creditCard.getMaskedCardNumber();
                fromName = user.getFullName();

                // USE THE NEW SERVICE TO PROCESS THE TRANSFER
                CreditAccount updatedAccount = creditAccountServiceImpl.transferFromCredit(
                    creditAccount.getId(),
                    recipientAccountNumber,
                    amount,
                    description
                );
                
                fromAccountId = updatedAccount.getId();
                fromAccountMasked = updatedAccount.getMaskedAccountNumber();
                newBalance = updatedAccount.getCurrentBalance();

                // Update card last used date
                creditCard.setLastUsedDate(LocalDateTime.now());
                creditCardRepository.save(creditCard);
                
                System.out.println("Credit payment of " + amount + " processed successfully via new service");
                System.out.println("Recipient " + recipientAccountNumber + " credited with " + amount);

            } else {
                // Handle debit card payment (EXACTLY AS BEFORE - NO CHANGES)
                Card debitCard = debitCardOpt.get();
                System.out.println("Debit card found: ID=" + debitCard.getId() + ", Type=" + debitCard.getCardType());
                
                // Check if card is active
                if (!debitCard.isActive()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Card is not active - status: " + debitCard.getStatus()
                    ));
                }

                Account sourceAccount = debitCard.getAccount();
                user = sourceAccount.getUser();
                cardType = "DEBIT";
                cardHolderName = debitCard.getCardHolderName();
                maskedCardNumber = debitCard.getMaskedCardNumber();
                fromName = sourceAccount.getOwnerName();

                // Verify ZIP code
                String accountZipCode = user.getZipCode();
                if (accountZipCode == null || accountZipCode.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "No ZIP code associated with this account"
                    ));
                }

                String cleanInputZip = zipCode.replaceAll("[\\s-]", "");
                String cleanAccountZip = accountZipCode.replaceAll("[\\s-]", "");
                
                if (!cleanAccountZip.equals(cleanInputZip)) {
                    debitCard.incrementFailedPinAttempts();
                    cardRepository.save(debitCard);
                    
                    return ResponseEntity.status(401).body(Map.of(
                        "error", "Invalid ZIP code",
                        "remainingAttempts", 3 - debitCard.getFailedPinAttempts()
                    ));
                }

                // Reset failed attempts on successful verification
                debitCard.resetFailedPinAttempts();
                debitCard.setLastUsedDate(LocalDateTime.now());
                cardRepository.save(debitCard);

                // Check if source account has sufficient funds
                if (sourceAccount.getBalance() < amount) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Insufficient funds",
                        "availableBalance", sourceAccount.getBalance()
                    ));
                }

                // Perform the transfer
                Account updatedSource = accountService.transfer(
                    sourceAccount.getId(), 
                    recipientAccount != null ? recipientAccount.getId() : null, 
                    amount
                );
                
                fromAccountId = sourceAccount.getId();
                fromAccountMasked = "****" + sourceAccount.getAccountNumber()
                    .substring(Math.max(0, sourceAccount.getAccountNumber().length() - 4));
                newBalance = updatedSource.getBalance();
            }

            String toAccountMasked = recipientAccount != null ? 
                "****" + recipientAccount.getAccountNumber()
                    .substring(Math.max(0, recipientAccount.getAccountNumber().length() - 4)) : 
                "****" + recipientAccountNumber.substring(Math.max(0, recipientAccountNumber.length() - 4));

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("amount", amount);
            response.put("fromAccount", fromAccountMasked);
            response.put("fromAccountId", fromAccountId);
            response.put("fromCard", maskedCardNumber);
            response.put("fromName", fromName);
            response.put("cardType", cardType);
            response.put("toAccount", toAccountMasked);
            response.put("toAccountId", recipientAccount != null ? recipientAccount.getId() : null);
            response.put("toName", recipientAccount != null ? recipientAccount.getOwnerName() : "External Account");
            response.put("newBalance", newBalance);
            response.put("timestamp", LocalDateTime.now());
            response.put("description", description);

            System.out.println("=== PAYMENT COMPLETED SUCCESSFULLY ===");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("=== PAYMENT FAILED ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    /**
     * GET /api/card-payments/card-info
     * Get public card info by card number (masked)
     * Supports both debit and credit cards
     */
    @GetMapping("/card-info")
    public ResponseEntity<?> getCardInfo(@RequestParam String cardNumber) {
        try {
            System.out.println("=== CARD INFO REQUEST ===");
            System.out.println("Card Number: " + cardNumber);
            
            String cleanCardNumber = cardNumber.replaceAll("[\\s-]", "");
            System.out.println("Cleaned card number: " + cleanCardNumber);
            
            // Try to find as debit card first
            Optional<Card> debitCardOpt = cardRepository.findByCleanCardNumber(cleanCardNumber);
            
            // Try to find as credit card if not found as debit
            Optional<CreditCard> creditCardOpt = debitCardOpt.isEmpty() ? 
                creditCardRepository.findByCleanCardNumber(cleanCardNumber) : Optional.empty();

            if (debitCardOpt.isEmpty() && creditCardOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Card not found with number: " + cleanCardNumber
                ));
            }

            Map<String, Object> cardInfo = new HashMap<>();

            if (creditCardOpt.isPresent()) {
                CreditCard creditCard = creditCardOpt.get();
                CreditAccount creditAccount = creditCard.getCreditAccount();
                
                cardInfo.put("maskedCardNumber", creditCard.getMaskedCardNumber());
                cardInfo.put("cardHolderName", creditCard.getCardHolderName());
                cardInfo.put("cardType", "CREDIT - " + creditCard.getCardType());
                cardInfo.put("status", creditCard.getStatus());
                cardInfo.put("isActive", "ACTIVE".equals(creditCard.getStatus()));
                cardInfo.put("accountId", creditAccount.getId());
                cardInfo.put("accountType", "CREDIT");
                
            } else {
                Card debitCard = debitCardOpt.get();
                Account account = debitCard.getAccount();
                
                cardInfo.put("maskedCardNumber", debitCard.getMaskedCardNumber());
                cardInfo.put("cardHolderName", debitCard.getCardHolderName());
                cardInfo.put("cardType", "DEBIT - " + debitCard.getCardType());
                cardInfo.put("status", debitCard.getStatus());
                cardInfo.put("isActive", debitCard.isActive());
                cardInfo.put("accountId", account.getId());
                cardInfo.put("accountType", "DEBIT");
            }

            System.out.println("=== CARD INFO SUCCESS ===");
            return ResponseEntity.ok(cardInfo);

        } catch (Exception e) {
            System.out.println("=== CARD INFO FAILED ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/card-payments/transactions
     * Get transactions made with a specific card
     * Supports both debit and credit cards
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getCardTransactions(@RequestParam String cardNumber) {
        try {
            System.out.println("=== CARD TRANSACTIONS REQUEST ===");
            System.out.println("Card Number: " + cardNumber);
            
            String cleanCardNumber = cardNumber.replaceAll("[\\s-]", "");
            System.out.println("Cleaned card number: " + cleanCardNumber);
            
            // Try to find as debit card first
            Optional<Card> debitCardOpt = cardRepository.findByCleanCardNumber(cleanCardNumber);
            
            // Try to find as credit card if not found as debit
            Optional<CreditCard> creditCardOpt = debitCardOpt.isEmpty() ? 
                creditCardRepository.findByCleanCardNumber(cleanCardNumber) : Optional.empty();

            if (debitCardOpt.isEmpty() && creditCardOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Card not found with number: " + cleanCardNumber
                ));
            }

            List<TransactionDTO> transactions;
            String maskedCardNumber;

            if (creditCardOpt.isPresent()) {
                CreditCard creditCard = creditCardOpt.get();
                @SuppressWarnings("unused")
                CreditAccount creditAccount = creditCard.getCreditAccount();
                maskedCardNumber = creditCard.getMaskedCardNumber();
                
                // Get credit card transactions
                transactions = List.of(); // TODO: Implement credit card transactions
                
            } else {
                Card debitCard = debitCardOpt.get();
                Account account = debitCard.getAccount();
                maskedCardNumber = debitCard.getMaskedCardNumber();
                
                transactions = transactionService.getTransactionsByAccountId(account.getId());
            }

            System.out.println("Found " + transactions.size() + " transactions");

            return ResponseEntity.ok(Map.of(
                "cardNumber", maskedCardNumber,
                "transactions", transactions
            ));

        } catch (Exception e) {
            System.out.println("=== CARD TRANSACTIONS FAILED ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
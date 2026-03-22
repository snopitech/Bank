package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditApplication;
import com.snopitech.snopitechbank.model.CreditIncreaseRequest;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.CreditAccountService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditApplicationRepository;
import com.snopitech.snopitechbank.repository.CreditIncreaseRequestRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit")
public class CreditAccountController {

    @Autowired
    private CreditAccountService creditAccountService;

    @SuppressWarnings("unused")
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CreditApplicationRepository creditApplicationRepository;
    
    @Autowired
    private CreditAccountRepository creditAccountRepository;
    
    @Autowired
    private CreditIncreaseRequestRepository creditIncreaseRequestRepository;

    // Helper method to get user from sessionId (keep for other endpoints)
    @SuppressWarnings("unused")
    private User getUserFromSession(String sessionId) {
        return userRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Get all credit accounts for a user (matches business account pattern)
     * GET /api/credit/accounts/user/{userId}
     */
    @GetMapping("/accounts/user/{userId}")
public ResponseEntity<?> getUserCreditAccounts(@PathVariable Long userId) {
    try {
        System.out.println("=== getUserCreditAccounts called for userId: " + userId);
        
        // Get accounts with cards loaded
        List<CreditAccount> accounts = creditAccountService.getUserAccountsWithCards(userId);
        System.out.println("Accounts found: " + accounts.size());
        
        // Only mask account number, NOT card numbers
        accounts.forEach(account -> {
            account.setAccountNumber(account.getMaskedAccountNumber());
            // DO NOT mask card numbers - send real numbers for reveal functionality
            // But still remove CVV for security
            if (account.getCards() != null) {
                account.getCards().forEach(card -> {
                    // REMOVE THIS LINE: card.setCardNumber(card.getMaskedCardNumber());
                    card.setCvv(null); // Still remove CVV for security
                });
            }
        });
        
        return ResponseEntity.ok(accounts);
        
    } catch (Exception e) {
        System.err.println("ERROR in getUserCreditAccounts: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
    /**
     * Get specific credit account by ID (only if it belongs to current user)
     * GET /api/credit/accounts/{id}?userId={userId}
     */
    @GetMapping("/accounts/{id}")
    public ResponseEntity<?> getAccount(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            CreditAccount account = creditAccountService.getAccountWithCards(id);
            
            // Verify ownership
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this account"));
            }
            
            // Mask sensitive info
            account.setAccountNumber(account.getMaskedAccountNumber());
            
            Map<String, Object> response = new HashMap<>();
            response.put("account", account);
            response.put("cards", account.getCards().stream().map(card -> {
                Map<String, Object> cardInfo = new HashMap<>();
                cardInfo.put("id", card.getId());
                cardInfo.put("cardType", card.getCardType());
                cardInfo.put("maskedNumber", card.getMaskedCardNumber());
                cardInfo.put("status", card.getStatus());
                cardInfo.put("creditLimit", card.getCreditLimit());
                cardInfo.put("availableCredit", card.getAvailableCredit());
                return cardInfo;
            }));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reveal full account number (temporary, 30 second view)
     * POST /api/credit/accounts/{id}/reveal?userId={userId}
     */
    @PostMapping("/accounts/{id}/reveal")
    public ResponseEntity<?> revealAccountNumber(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            CreditAccount account = creditAccountService.getAccount(id);
            
            // Verify ownership
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this account"));
            }

            // Log this action for security
            System.out.println("CREDIT ACCOUNT REVEALED: Account ID " + id + 
                              " for user " + userId + " at " + LocalDateTime.now());

            Map<String, Object> response = new HashMap<>();
            response.put("accountId", account.getId());
            response.put("accountNumber", account.getAccountNumber()); // Full unmasked number
            response.put("maskedNumber", account.getMaskedAccountNumber());
            response.put("expiresIn", 30);
            response.put("message", "Account number will auto-hide in 30 seconds");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Make a payment to credit account (ORIGINAL - kept for backward compatibility)
     * POST /api/credit/accounts/{id}/payments?userId={userId}
     */
    @PostMapping("/accounts/{id}/payments")
    public ResponseEntity<?> makePayment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Map<String, Double> request) {
        try {
            CreditAccount account = creditAccountService.getAccount(id);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to modify this account"));
            }
            
            Double amount = request.get("amount");
            if (amount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }
            
            CreditAccount updatedAccount = creditAccountService.makePayment(id, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment successful");
            response.put("newBalance", updatedAccount.getCurrentBalance());
            response.put("availableCredit", updatedAccount.getAvailableCredit());
            response.put("paymentDate", updatedAccount.getLastPaymentDate());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== NEW ENDPOINT - Make payment from source account ====================
    /**
     * Make a payment to credit account from a source account (checking/savings/business)
     * POST /api/credit/accounts/{id}/payments/from-source?userId={userId}
     */
    @PostMapping("/accounts/{id}/payments/from-source")
    public ResponseEntity<?> makePaymentFromSource(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            CreditAccount account = creditAccountService.getAccount(id);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to modify this account"));
            }
            
            Long sourceAccountId = request.get("sourceAccountId") != null ? 
                Long.parseLong(request.get("sourceAccountId").toString()) : null;
            Double amount = request.get("amount") != null ? 
                Double.parseDouble(request.get("amount").toString()) : null;
            
            if (sourceAccountId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Source account ID is required"));
            }
            
            if (amount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }
            
            CreditAccount updatedAccount = creditAccountService.makePaymentFromSource(id, sourceAccountId, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment successful");
            response.put("newBalance", updatedAccount.getCurrentBalance());
            response.put("availableCredit", updatedAccount.getAvailableCredit());
            response.put("paymentDate", updatedAccount.getLastPaymentDate());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // ==================== END NEW ENDPOINT ====================

    /**
     * Freeze credit account (customer)
     * POST /api/credit/accounts/{id}/freeze?userId={userId}
     */
    @PostMapping("/accounts/{id}/freeze")
    public ResponseEntity<?> freezeAccount(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Map<String, String> request) {
        try {
            CreditAccount account = creditAccountService.getAccount(id);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to modify this account"));
            }
            
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Requested by customer";
            }
            
            CreditAccount frozenAccount = creditAccountService.freezeAccount(id, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account frozen successfully",
                "status", frozenAccount.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unfreeze credit account (customer)
     * POST /api/credit/accounts/{id}/unfreeze?userId={userId}
     */
    @PostMapping("/accounts/{id}/unfreeze")
    public ResponseEntity<?> unfreezeAccount(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            CreditAccount account = creditAccountService.getAccount(id);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to modify this account"));
            }
            
            CreditAccount unfrozenAccount = creditAccountService.unfreezeAccount(id);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account unfrozen successfully",
                "status", unfrozenAccount.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all credit accounts (admin)
     * GET /api/admin/credit/accounts?status=ACTIVE
     */
    @GetMapping("/admin/credit/accounts")
    public ResponseEntity<?> getAllAccounts(
            @RequestParam(required = false) String status) {
        try {
            List<CreditAccount> accounts = creditAccountService.getAllAccounts(status);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get account details for admin
     * GET /api/admin/credit/accounts/{id}
     */
    @GetMapping("/admin/credit/accounts/{id}")
    public ResponseEntity<?> getAccountAdmin(@PathVariable Long id) {
        try {
            CreditAccount account = creditAccountService.getAccountWithCards(id);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Freeze account (admin)
     * POST /api/admin/credit/accounts/{id}/freeze
     */
    @PostMapping("/admin/credit/accounts/{id}/freeze")
    public ResponseEntity<?> freezeAccountAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
            }
            
            CreditAccount frozenAccount = creditAccountService.freezeAccount(id, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account frozen successfully",
                "status", frozenAccount.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unfreeze account (admin)
     * POST /api/admin/credit/accounts/{id}/unfreeze
     */
    @PostMapping("/admin/credit/accounts/{id}/unfreeze")
    public ResponseEntity<?> unfreezeAccountAdmin(@PathVariable Long id) {
        try {
            CreditAccount unfrozenAccount = creditAccountService.unfreezeAccount(id);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account unfrozen successfully",
                "status", unfrozenAccount.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Close account (admin)
     * POST /api/admin/credit/accounts/{id}/close
     */
    @PostMapping("/admin/credit/accounts/{id}/close")
    public ResponseEntity<?> closeAccountAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
            }
            
            CreditAccount closedAccount = creditAccountService.closeAccount(id, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account closed successfully",
                "status", closedAccount.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get accounts with high utilization (admin)
     * GET /api/admin/credit/accounts/high-utilization
     */
    @GetMapping("/admin/credit/accounts/high-utilization")
    public ResponseEntity<?> getHighUtilizationAccounts() {
        try {
            List<CreditAccount> accounts = creditAccountService.getHighUtilizationAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get accounts eligible for increase (admin)
     * GET /api/admin/credit/accounts/eligible-for-increase
     */
    @GetMapping("/admin/credit/accounts/eligible-for-increase")
    public ResponseEntity<?> getAccountsEligibleForIncrease() {
        try {
            List<CreditAccount> accounts = creditAccountService.getAccountsEligibleForIncrease();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get account statistics (admin)
     * GET /api/admin/credit/accounts/statistics
     */
    @GetMapping("/admin/credit/accounts/statistics")
    public ResponseEntity<?> getAccountStatistics() {
        try {
            CreditAccountService.AccountStatistics stats = creditAccountService.getAccountStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions for a credit account
     * GET /api/credit/accounts/{accountId}/transactions
     */
    @GetMapping("/accounts/{accountId}/transactions")
    public ResponseEntity<?> getAccountTransactions(
            @PathVariable Long accountId,
            @RequestParam(required = false) Long userId) {
        try {
            // Verify account exists
            CreditAccount account = creditAccountService.getAccount(accountId);
            
            // If userId provided, verify ownership
            if (userId != null && !account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this account"));
            }
            
            // Get transactions - you'll need to implement this in service
            List<?> transactions = creditAccountService.getAccountTransactions(accountId);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== HR/ADMIN DELETE ENDPOINT ====================

    /**
     * Permanently delete a credit account (HR only)
     * DELETE /api/credit/hr/credit/accounts/{id}
     */
    @DeleteMapping("/hr/credit/accounts/{id}")
    public ResponseEntity<?> deleteAccountPermanently(@PathVariable Long id) {
        try {
            // First, delete credit increase requests
            List<CreditIncreaseRequest> increaseRequests = creditIncreaseRequestRepository.findByCreditAccountId(id);
            if (increaseRequests != null && !increaseRequests.isEmpty()) {
                creditIncreaseRequestRepository.deleteAll(increaseRequests);
            }
            
            // Then delete credit applications
            List<CreditApplication> applications = creditApplicationRepository.findByCreditAccountId(id);
            if (applications != null && !applications.isEmpty()) {
                creditApplicationRepository.deleteAll(applications);
            }
            
            // Finally delete the account
            creditAccountRepository.deleteById(id);
            
            return ResponseEntity.ok(Map.of(
                "message", "Credit account and all associated records permanently deleted",
                "accountId", id
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
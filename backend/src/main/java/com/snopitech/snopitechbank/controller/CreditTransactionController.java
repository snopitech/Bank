package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditTransaction;
import com.snopitech.snopitechbank.service.CreditAccountService;
import com.snopitech.snopitechbank.service.CreditTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit")
public class CreditTransactionController {

    @Autowired
    private CreditTransactionService creditTransactionService;

    @Autowired
    private CreditAccountService creditAccountService;

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Get paginated transactions for a credit account
     * GET /api/credit/accounts/{accountId}/transactions/paginated?userId={userId}&page=0&size=10
     */
    @GetMapping("/accounts/{accountId}/transactions/paginated")
    public ResponseEntity<?> getAccountTransactionsPaginated(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            Page<CreditTransaction> transactions = 
                creditTransactionService.getAccountTransactionsPaginated(accountId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions.getContent());
            response.put("currentPage", transactions.getNumber());
            response.put("totalItems", transactions.getTotalElements());
            response.put("totalPages", transactions.getTotalPages());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions for a specific credit card
     * GET /api/credit/cards/{cardId}/transactions?userId={userId}
     */
    @GetMapping("/cards/{cardId}/transactions")
    public ResponseEntity<?> getCardTransactions(
            @RequestParam Long userId,
            @PathVariable Long cardId) {
        try {
            // Note: You'll need to add verification that the card belongs to the user
            // This might require a card service method to check ownership
            List<CreditTransaction> transactions = 
                creditTransactionService.getCardTransactions(cardId);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Filter transactions with multiple criteria
     * GET /api/credit/accounts/{accountId}/transactions/filter?userId={userId}&type=PURCHASE&category=FOOD
     */
    @GetMapping("/accounts/{accountId}/transactions/filter")
    public ResponseEntity<?> filterTransactions(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            Page<CreditTransaction> transactions = creditTransactionService.filterTransactions(
                accountId, type, status, category, startDate, endDate, 
                minAmount, maxAmount, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions.getContent());
            response.put("currentPage", transactions.getNumber());
            response.put("totalItems", transactions.getTotalElements());
            response.put("totalPages", transactions.getTotalPages());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions by date range
     * GET /api/credit/accounts/{accountId}/transactions/date-range?userId={userId}&startDate=...&endDate=...
     */
    @GetMapping("/accounts/{accountId}/transactions/date-range")
    public ResponseEntity<?> getTransactionsByDateRange(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            List<CreditTransaction> transactions = 
                creditTransactionService.getTransactionsByDateRange(accountId, startDate, endDate);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions by type
     * GET /api/credit/accounts/{accountId}/transactions/type/{type}?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/transactions/type/{type}")
    public ResponseEntity<?> getTransactionsByType(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @PathVariable String type) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            List<CreditTransaction> transactions = 
                creditTransactionService.getTransactionsByType(accountId, type);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions by merchant
     * GET /api/credit/accounts/{accountId}/transactions/merchant/{merchant}?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/transactions/merchant/{merchant}")
    public ResponseEntity<?> getTransactionsByMerchant(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @PathVariable String merchant) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            List<CreditTransaction> transactions = 
                creditTransactionService.getTransactionsByMerchant(accountId, merchant);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transactions by category
     * GET /api/credit/accounts/{accountId}/transactions/category/{category}?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/transactions/category/{category}")
    public ResponseEntity<?> getTransactionsByCategory(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @PathVariable String category) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            List<CreditTransaction> transactions = 
                creditTransactionService.getTransactionsByCategory(accountId, category);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transaction by reference number
     * GET /api/credit/transactions/reference/{referenceNumber}?userId={userId}
     */
    @GetMapping("/transactions/reference/{referenceNumber}")
    public ResponseEntity<?> getTransactionByReference(
            @RequestParam Long userId,
            @PathVariable String referenceNumber) {
        try {
            CreditTransaction transaction = 
                creditTransactionService.getTransactionByReference(referenceNumber);
            
            // Verify transaction belongs to user
            if (!transaction.getCreditAccount().getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this transaction"));
            }
            
            return ResponseEntity.ok(transaction);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get recent transactions
     * GET /api/credit/accounts/{accountId}/transactions/recent?userId={userId}&limit=5
     */
    @GetMapping("/accounts/{accountId}/transactions/recent")
    public ResponseEntity<?> getRecentTransactions(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these transactions"));
            }

            List<CreditTransaction> transactions = 
                creditTransactionService.getRecentTransactions(accountId, limit);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transaction statistics
     * GET /api/credit/accounts/{accountId}/transactions/statistics?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/transactions/statistics")
    public ResponseEntity<?> getTransactionStatistics(
            @RequestParam Long userId,
            @PathVariable Long accountId) {
        try {
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these statistics"));
            }

            CreditTransactionService.TransactionStatistics stats = 
                creditTransactionService.getTransactionStatistics(accountId);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
          
         /**
 * Clear all transactions for a credit account (admin only)
 * DELETE /api/admin/credit/accounts/{accountId}/transactions/clear
 */
@DeleteMapping("/admin/credit/accounts/{accountId}/transactions/clear")
public ResponseEntity<?> clearCreditAccountTransactions(
        @RequestHeader("sessionId") String sessionId,
        @PathVariable Long accountId) {
    try {
        // Verify account exists (optional)
        @SuppressWarnings("unused")
        CreditAccount account = creditAccountService.getAccount(accountId);
        
        // Clear the transactions
        creditTransactionService.clearTransactionsByAccountId(accountId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All transactions cleared for credit account: " + accountId);
        response.put("accountId", accountId);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage(),
            "timestamp", LocalDateTime.now()
        ));
    }
}
    // ==================== ADMIN ENDPOINTS ====================
    // These still use sessionId as they're for internal admin use only

    /**
     * Get all transactions for an account (admin)
     * GET /api/admin/credit/accounts/{accountId}/transactions
     */
    @GetMapping("/admin/credit/accounts/{accountId}/transactions")
    public ResponseEntity<?> getAccountTransactionsAdmin(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long accountId) {
        try {
            // Add admin role check here if needed
            List<CreditTransaction> transactions = 
                creditTransactionService.getAccountTransactions(accountId);
            
            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get transaction by ID (admin)
     * GET /api/admin/credit/transactions/{id}
     */
    @GetMapping("/admin/credit/transactions/{id}")
    public ResponseEntity<?> getTransactionByIdAdmin(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long id) {
        try {
            // Add admin role check here if needed
            CreditTransaction transaction = creditTransactionService.getTransactionById(id);
            return ResponseEntity.ok(transaction);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
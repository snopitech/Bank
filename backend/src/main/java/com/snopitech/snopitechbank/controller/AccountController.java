package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.AccountSummaryResponse;
import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Overdraft;
import com.snopitech.snopitechbank.model.StopPayment;
import com.snopitech.snopitechbank.model.DownloadHistory;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.Statement;
import com.snopitech.snopitechbank.service.AccountService;
import com.snopitech.snopitechbank.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.format.annotation.DateTimeFormat;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    @SuppressWarnings("unused")
    private final TransactionService transactionService;

    public AccountController(AccountService accountService,
                             TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    // ⭐ Deposit by ID
    @PostMapping("/{id}/deposit")
    public Account deposit(@PathVariable Long id, @RequestParam double amount) {
        return accountService.deposit(id, amount);
    }

    // ⭐ Withdraw by ID
    @PostMapping("/{id}/withdraw")
    public Account withdraw(@PathVariable Long id, @RequestParam double amount) {
        return accountService.withdraw(id, amount);
    }

    // ⭐ Deposit by account number (existing)
    @PostMapping("/deposit")
    public Account depositByAccountNumber(@RequestParam String accountNumber,
                                          @RequestParam double amount) {
        return accountService.depositByAccountNumber(accountNumber, amount);
    }

    // ⭐ NEW — Deposit by account number (matches /deposit/account-number)
    @PostMapping("/deposit/account-number")
    public Account depositByAccountNumberPath(@RequestParam String accountNumber,
                                              @RequestParam double amount) {
        return accountService.depositByAccountNumber(accountNumber, amount);
    }

    // ⭐ Withdraw by account number (existing)
    @PostMapping("/withdraw")
    public Account withdrawByAccountNumber(@RequestParam String accountNumber,
                                           @RequestParam double amount) {
        return accountService.withdrawByAccountNumber(accountNumber, amount);
    }

    // ⭐ NEW — Withdraw by account number (matches /withdraw/account-number)
    @PostMapping("/withdraw/account-number")
    public Account withdrawByAccountNumberPath(@RequestParam String accountNumber,
                                               @RequestParam double amount) {
        return accountService.withdrawByAccountNumber(accountNumber, amount);
    }

    // ⭐ Transfer by ID
    @PostMapping("/{fromId}/transfer/{toId}")
    public Account transfer(@PathVariable Long fromId,
                            @PathVariable Long toId,
                            @RequestParam double amount) {
        return accountService.transfer(fromId, toId, amount);
    }

    // ⭐ Transfer by account number (existing)
    @PostMapping("/transfer")
    public Account transferByAccountNumber(@RequestParam String fromAccountNumber,
                                           @RequestParam String toAccountNumber,
                                           @RequestParam double amount) {
        return accountService.transferByAccountNumber(fromAccountNumber, toAccountNumber, amount);
    }

    // ⭐ NEW — Transfer by account number (matches /transfer/account-number)
    @PostMapping("/transfer/account-number")
    public Account transferByAccountNumberPath(@RequestParam String fromAccountNumber,
                                               @RequestParam String toAccountNumber,
                                               @RequestParam double amount) {
        return accountService.transferByAccountNumber(fromAccountNumber, toAccountNumber, amount);
    }

    // ⭐ Get account by ID
    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    // ⭐ Get account by account number
    @GetMapping("/account-number")
    public Account getAccountByAccountNumber(@RequestParam String accountNumber) {
        return accountService.getAccountByAccountNumber(accountNumber);
    }

    // ⭐ Global account summary (all accounts)
    @GetMapping("/summary")
    public AccountSummaryResponse getSummary() {
        return accountService.getSummary();
    }

    // ⭐ NEW — Individual summary by ID
    @GetMapping("/{id}/summary")
    public AccountSummaryResponse getSummaryById(@PathVariable Long id) {
        return accountService.getSummaryByAccountId(id);
    }

    // ⭐ NEW — Individual summary by ACCOUNT NUMBER (added this)
    @GetMapping("/summary/by-account-number")
    public AccountSummaryResponse getSummaryByAccountNumber(@RequestParam String accountNumber) {
        return accountService.getSummaryByAccountNumber(accountNumber);
    }

    // ⭐ Delete user by account number
    @DeleteMapping("/delete-user")
    public void deleteUserByAccountNumber(@RequestParam String accountNumber) {
        accountService.deleteUserByAccountNumber(accountNumber);
    }

    // ============== NEW ENDPOINTS FOR MANAGE ACCOUNTS ==============

    /**
     * Get all accounts for a specific user
     * GET /api/accounts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAccounts(@PathVariable Long userId) {
        try {
            List<Account> accounts = accountService.getAccountsByUserId(userId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update account nickname
     * PUT /api/accounts/{accountId}/nickname
     * Request body: { "nickname": "My Vacation Fund" }
     */
    @PutMapping("/{accountId}/nickname")
    public ResponseEntity<?> updateAccountNickname(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        try {
            String nickname = request.get("nickname");
            if (nickname == null || nickname.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nickname cannot be empty"));
            }
            Account updatedAccount = accountService.updateAccountNickname(accountId, nickname);
            return ResponseEntity.ok(updatedAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get detailed account information
     * GET /api/accounts/{accountId}/details
     */
    @GetMapping("/{accountId}/details")
    public ResponseEntity<?> getAccountDetails(@PathVariable Long accountId) {
        try {
            Account account = accountService.getAccountById(accountId);
            
            // Build detailed response
            Map<String, Object> details = new HashMap<>();
            details.put("accountId", account.getId());
            details.put("accountNumber", account.getAccountNumber());
            details.put("accountType", account.getAccountType());
            details.put("balance", account.getBalance());
            details.put("ownerName", account.getOwnerName());
            details.put("routingNumber", account.getRoutingNumber());
            details.put("nickname", account.getNickname());
            
            // Add account-specific features based on type
            if ("CHECKING".equals(account.getAccountType())) {
                details.put("monthlyFee", "$0.00");
                details.put("interestRate", "0.01% APY");
                details.put("overdraftProtection", "Available");
                details.put("features", List.of(
                    "Unlimited transactions",
                    "Free debit card",
                    "Online banking access",
                    "Mobile check deposit"
                ));
            } else if ("SAVINGS".equals(account.getAccountType())) {
                details.put("monthlyFee", "$0.00 (with $300 minimum balance)");
                details.put("interestRate", "2.25% APY");
                details.put("withdrawalLimit", "6 per month");
                details.put("features", List.of(
                    "High interest savings",
                    "Automatic savings plans",
                    "Online transfers",
                    "FDIC insured"
                ));
            }
            
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ============== NEW ENDPOINTS FOR CLOSE ACCOUNT ==============

    /**
     * Soft close an account with reason
     * POST /api/accounts/{accountId}/close
     * Request body: { "reason": "No longer needed" }
     */
    @PostMapping("/{accountId}/close")
    public ResponseEntity<?> closeAccount(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Customer request";
            }
            
            accountService.closeAccount(accountId, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account closed successfully",
                "accountId", accountId,
                "reason", reason
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // Add these endpoints after the closeAccount endpoint (around line 250)

/**
 * Disable an account (temporary freeze)
 * POST /api/accounts/{accountId}/disable
 */
@PostMapping("/{accountId}/disable")
public ResponseEntity<?> disableAccount(@PathVariable Long accountId) {
    try {
        accountService.disableAccount(accountId);
        return ResponseEntity.ok(Map.of(
            "message", "Account disabled successfully",
            "accountId", accountId
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

/**
 * Enable a disabled account
 * POST /api/accounts/{accountId}/enable
 */
@PostMapping("/{accountId}/enable")
public ResponseEntity<?> enableAccount(@PathVariable Long accountId) {
    try {
        accountService.enableAccount(accountId);
        return ResponseEntity.ok(Map.of(
            "message", "Account enabled successfully",
            "accountId", accountId
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    /**
     * Permanently delete an account (use with caution)
     * DELETE /api/accounts/{accountId}
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> permanentlyDeleteAccount(@PathVariable Long accountId) {
        try {
            accountService.permanentlyDeleteAccount(accountId);
            return ResponseEntity.ok(Map.of(
                "message", "Account permanently deleted",
                "accountId", accountId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============== NEW ENDPOINTS FOR OVERDRAFT SERVICES ==============

    /**
     * Get overdraft settings for an account
     * GET /api/accounts/{accountId}/overdraft
     */
    @GetMapping("/{accountId}/overdraft")
    public ResponseEntity<?> getOverdraftSettings(@PathVariable Long accountId) {
        try {
            Overdraft overdraft = accountService.getOverdraftSettings(accountId);
            return ResponseEntity.ok(overdraft);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update overdraft protection settings
     * PUT /api/accounts/{accountId}/overdraft
     * Request body: {
     *   "overdraftEnabled": true,
     *   "overdraftLimit": 500.00,
     *   "autoSweepEnabled": false,
     *   "sweepAccountId": 123
     * }
     */
    @PutMapping("/{accountId}/overdraft")
    public ResponseEntity<?> updateOverdraftSettings(
            @PathVariable Long accountId,
            @RequestBody Map<String, Object> request) {
        try {
            Boolean overdraftEnabled = request.containsKey("overdraftEnabled") 
                ? Boolean.valueOf(request.get("overdraftEnabled").toString()) 
                : null;
            
            Double overdraftLimit = request.containsKey("overdraftLimit") 
                ? Double.valueOf(request.get("overdraftLimit").toString()) 
                : null;
            
            Boolean autoSweepEnabled = request.containsKey("autoSweepEnabled") 
                ? Boolean.valueOf(request.get("autoSweepEnabled").toString()) 
                : null;
            
            Long sweepAccountId = request.containsKey("sweepAccountId") 
                ? Long.valueOf(request.get("sweepAccountId").toString()) 
                : null;
            
            Overdraft updated = accountService.updateOverdraftSettings(
                accountId, overdraftEnabled, overdraftLimit, autoSweepEnabled, sweepAccountId
            );
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============== NEW ENDPOINTS FOR STOP PAYMENTS ==============

    /**
     * Get all stop payments for an account
     * GET /api/accounts/{accountId}/stop-payments
     */
    @GetMapping("/{accountId}/stop-payments")
    public ResponseEntity<?> getStopPayments(@PathVariable Long accountId) {
        try {
            List<StopPayment> stopPayments = accountService.getStopPayments(accountId);
            return ResponseEntity.ok(stopPayments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get active stop payments for an account
     * GET /api/accounts/{accountId}/stop-payments/active
     */
    @GetMapping("/{accountId}/stop-payments/active")
    public ResponseEntity<?> getActiveStopPayments(@PathVariable Long accountId) {
        try {
            List<StopPayment> stopPayments = accountService.getActiveStopPayments(accountId);
            return ResponseEntity.ok(stopPayments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Place a stop payment on a check
     * POST /api/accounts/{accountId}/stop-payment
     * Request body: {
     *   "checkNumber": "1001",
     *   "payeeName": "John Doe",
     *   "amount": 500.00,
     *   "checkDate": "2024-01-15",
     *   "reason": "Lost check"
     * }
     */
    @PostMapping("/{accountId}/stop-payment")
    public ResponseEntity<?> placeStopPayment(
            @PathVariable Long accountId,
            @RequestBody Map<String, Object> request) {
        try {
            String checkNumber = (String) request.get("checkNumber");
            String payeeName = (String) request.get("payeeName");
            Double amount = request.containsKey("amount") 
                ? Double.valueOf(request.get("amount").toString()) 
                : null;
            LocalDate checkDate = request.containsKey("checkDate") 
                ? LocalDate.parse(request.get("checkDate").toString()) 
                : null;
            String reason = (String) request.get("reason");
            
            if (checkNumber == null || checkNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Check number is required"));
            }
            
            StopPayment stopPayment = accountService.placeStopPayment(
                accountId, checkNumber, payeeName, amount, checkDate, reason
            );
            
            return ResponseEntity.ok(stopPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove/release a stop payment
     * DELETE /api/accounts/{accountId}/stop-payment/{stopPaymentId}
     */
    @DeleteMapping("/{accountId}/stop-payment/{stopPaymentId}")
    public ResponseEntity<?> removeStopPayment(
            @PathVariable Long accountId,
            @PathVariable Long stopPaymentId) {
        try {
            accountService.removeStopPayment(stopPaymentId);
            return ResponseEntity.ok(Map.of(
                "message", "Stop payment released successfully",
                "stopPaymentId", stopPaymentId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get stop payment by ID
     * GET /api/accounts/stop-payment/{stopPaymentId}
     */
    @GetMapping("/stop-payment/{stopPaymentId}")
    public ResponseEntity<?> getStopPaymentById(@PathVariable Long stopPaymentId) {
        try {
            StopPayment stopPayment = accountService.getStopPaymentById(stopPaymentId);
            return ResponseEntity.ok(stopPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if a check has an active stop payment
     * GET /api/accounts/{accountId}/check/{checkNumber}/has-stop-payment
     */
    @GetMapping("/{accountId}/check/{checkNumber}/has-stop-payment")
    public ResponseEntity<?> hasActiveStopPayment(
            @PathVariable Long accountId,
            @PathVariable String checkNumber) {
        try {
            boolean hasStopPayment = accountService.hasActiveStopPayment(accountId, checkNumber);
            return ResponseEntity.ok(Map.of(
                "accountId", accountId,
                "checkNumber", checkNumber,
                "hasStopPayment", hasStopPayment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============== NEW ENDPOINTS FOR DOWNLOAD HISTORY ==============

    /**
     * Get download history for a user
     * GET /api/accounts/download-history/{userId}
     */
    @GetMapping("/download-history/{userId}")
    public ResponseEntity<?> getDownloadHistory(@PathVariable Long userId) {
        try {
            List<DownloadHistory> history = accountService.getDownloadHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get recent downloads for a user (last 10)
     * GET /api/accounts/download-history/{userId}/recent
     */
    @GetMapping("/download-history/{userId}/recent")
    public ResponseEntity<?> getRecentDownloads(@PathVariable Long userId) {
        try {
            List<DownloadHistory> recent = accountService.getRecentDownloads(userId);
            return ResponseEntity.ok(recent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Save a download record (called when user downloads transactions)
     * POST /api/accounts/download-history
     * Request body: {
     *   "userId": 1,
     *   "accountId": 1,
     *   "fileName": "transactions_20260213.csv",
     *   "fileFormat": "CSV",
     *   "transactionCount": 45,
     *   "startDate": "2026-01-13T00:00:00",
     *   "endDate": "2026-02-13T23:59:59",
     *   "filterType": "all",
     *   "fileSize": 10240
     * }
     */
    @PostMapping("/download-history")
    public ResponseEntity<?> saveDownloadRecord(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long accountId = Long.valueOf(request.get("accountId").toString());
            String fileName = (String) request.get("fileName");
            String fileFormat = (String) request.get("fileFormat");
            Integer transactionCount = request.containsKey("transactionCount") 
                ? Integer.valueOf(request.get("transactionCount").toString()) 
                : null;
            
            // Fix: Handle date parsing safely
            LocalDateTime startDate = null;
            if (request.containsKey("startDate") && request.get("startDate") != null) {
                startDate = LocalDateTime.parse(request.get("startDate").toString());
            }
            
            LocalDateTime endDate = null;
            if (request.containsKey("endDate") && request.get("endDate") != null) {
                endDate = LocalDateTime.parse(request.get("endDate").toString());
            }
            
            String filterType = (String) request.get("filterType");
            Long fileSize = request.containsKey("fileSize") 
                ? Long.valueOf(request.get("fileSize").toString()) 
                : null;
            
            DownloadHistory saved = accountService.saveDownloadRecord(
                userId, accountId, fileName, fileFormat, 
                transactionCount, startDate, endDate, filterType, fileSize
            );
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============== NEW ENDPOINT FOR TRANSACTIONS EXPORT ==============

    /**
     * Export transactions for an account
     * GET /api/accounts/{accountId}/transactions/export
     * Query parameters:
     *   - format: csv, pdf, qfx, ofx (default: csv)
     *   - range: 30days, 60days, 90days, year, or use startDate/endDate
     *   - startDate: YYYY-MM-DD (for custom range)
     *   - endDate: YYYY-MM-DD (for custom range)
     *   - type: all, deposits, withdrawals, transfers (default: all)
     */
    @GetMapping("/{accountId}/transactions/export")
    public ResponseEntity<?> exportTransactions(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "all") String type,
            HttpServletRequest request) {
        
        try {
            // Generate export file
            byte[] fileContent = accountService.exportTransactions(
                accountId, format, range, startDate, endDate, type
            );
            
            // Get account for filename
            Account account = accountService.getAccountById(accountId);
            User user = account.getUser();
            
            // Create filename - use .html for PDF format
            String fileExt = format;
            if (format.equalsIgnoreCase("pdf")) {
                fileExt = "html"; // Save as HTML instead of PDF
            }
            
            String filename = String.format("transactions_%s_%s.%s", 
                account.getAccountNumber().substring(Math.max(0, account.getAccountNumber().length() - 4)),
                LocalDate.now().toString(),
                fileExt
            );
            
            // Save download history record
            try {
                // Parse date range for history
                LocalDateTime startDateTime = null;
                LocalDateTime endDateTime = null;
                
                if (startDate != null && endDate != null) {
                    startDateTime = startDate.atStartOfDay();
                    endDateTime = endDate.atTime(23, 59, 59);
                } else if (range != null) {
                    LocalDateTime now = LocalDateTime.now();
                    endDateTime = now;
                    
                    switch (range) {
                        case "30days":
                            startDateTime = now.minusDays(30);
                            break;
                        case "60days":
                            startDateTime = now.minusDays(60);
                            break;
                        case "90days":
                            startDateTime = now.minusDays(90);
                            break;
                        case "year":
                            startDateTime = now.minusYears(1);
                            break;
                    }
                }
                
                // For now, use 0 as placeholder since we don't have transaction count here
                int transactionCount = 0; // Placeholder
                
                accountService.saveDownloadRecord(
                    user.getId(),
                    accountId,
                    filename,
                    format.toUpperCase(),
                    transactionCount,
                    startDateTime,
                    endDateTime,
                    type,
                    (long) fileContent.length
                );
            } catch (Exception e) {
                // Log error but don't fail the download
                System.err.println("Failed to save download history: " + e.getMessage());
            }
            
            // Set response headers for file download
            HttpHeaders headers = new HttpHeaders();
            
            // Set content type based on format
            if (format.equalsIgnoreCase("pdf")) {
                headers.setContentType(MediaType.TEXT_HTML);
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(fileContent.length);
            
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============== NEW ENDPOINTS FOR STATEMENTS ==============

    /**
     * Get monthly statement for an account
     * GET /api/accounts/{accountId}/statements?year={year}&month={month}
     */
    @GetMapping("/{accountId}/statements")
    public ResponseEntity<?> getMonthlyStatement(
            @PathVariable Long accountId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            MonthlyStatementDTO statement = accountService.getMonthlyStatement(accountId, year, month);
            return ResponseEntity.ok(statement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Export statement as PDF
     * GET /api/accounts/{accountId}/statements/export?year={year}&month={month}
     */
    @GetMapping("/{accountId}/statements/export")
    public ResponseEntity<?> exportStatementPdf(
            @PathVariable Long accountId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            byte[] pdfContent = accountService.exportStatementPdf(accountId, year, month);
            
            Account account = accountService.getAccountById(accountId);
            String filename = String.format("statement_%s_%d-%02d.pdf", 
                account.getAccountNumber().substring(Math.max(0, account.getAccountNumber().length() - 4)),
                year, month);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfContent.length);
            
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all statements for an account
     * GET /api/accounts/{accountId}/statements/all
     */
    @GetMapping("/{accountId}/statements/all")
    public ResponseEntity<?> getAccountStatements(@PathVariable Long accountId) {
        try {
            List<Statement> statements = accountService.getAccountStatements(accountId);
            return ResponseEntity.ok(statements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get statements by year for an account
     * GET /api/accounts/{accountId}/statements/year/{year}
     */
    @GetMapping("/{accountId}/statements/year/{year}")
    public ResponseEntity<?> getStatementsByYear(
            @PathVariable Long accountId,
            @PathVariable int year) {
        try {
            List<Statement> statements = accountService.getStatementsByYear(accountId, year);
            return ResponseEntity.ok(statements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate a new statement
     * POST /api/accounts/{accountId}/statements/generate?year={year}&month={month}
     */
    @PostMapping("/{accountId}/statements/generate")
    public ResponseEntity<?> generateStatement(
            @PathVariable Long accountId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            Statement statement = accountService.generateStatement(accountId, year, month);
            return ResponseEntity.ok(statement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
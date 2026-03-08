package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.LoanAccount;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.LoanAccountRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.snopitech.snopitechbank.model.Transaction;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loan")
public class LoanAccountController {

    @Autowired
    private LoanAccountRepository loanAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Helper method to get user from sessionId
    private User getUserFromSession(String sessionId) {
        return userRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

    /**
     * GET /api/loan/accounts
     * Get all loan accounts for the logged-in user
     */
    @GetMapping("/accounts")
    public ResponseEntity<?> getUserLoanAccounts(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            List<LoanAccount> accounts = loanAccountRepository.findByUserId(user.getId());
            
            // Return simplified data for dashboard
            List<Map<String, Object>> response = accounts.stream().map(account -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", account.getId());
                map.put("maskedAccountNumber", account.getMaskedAccountNumber());
                map.put("approvedAmount", account.getApprovedAmount());
                map.put("outstandingBalance", account.getOutstandingBalance());
                map.put("monthlyPayment", account.getMonthlyPayment());
                map.put("interestRate", account.getInterestRate());
                map.put("nextPaymentDate", account.getNextPaymentDate());
                map.put("paymentsMade", account.getPaymentsMade());
                map.put("totalPayments", account.getTotalPayments());
                map.put("status", account.getStatus());
                map.put("startDate", account.getStartDate());
                map.put("maturityDate", account.getMaturityDate());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/loan/accounts/{id}
     * Get detailed loan account by ID
     */
    @GetMapping("/accounts/{id}")
    public ResponseEntity<?> getLoanAccountDetails(
            @PathVariable Long id,
            @RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            LoanAccount account = loanAccountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Loan account not found"));
            
            // Verify ownership
            if (!account.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
     /**
 * POST /api/loan/accounts/{id}/reveal
 * Reveal full account number (with security check)
 */
@PostMapping("/accounts/{id}/reveal")
public ResponseEntity<?> revealAccountNumber(
        @PathVariable Long id,
        @RequestHeader("sessionId") String sessionId) {
    try {
        User user = getUserFromSession(sessionId);
        LoanAccount account = loanAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan account not found"));
        
        // Verify ownership
        if (!account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        return ResponseEntity.ok(Map.of(
            "accountNumber", account.getAccountNumber()
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

/**
 * POST /api/loan/accounts/{id}/transfer
 * Transfer money from loan to another account
 */
@PostMapping("/accounts/{id}/transfer")
public ResponseEntity<?> transferFromLoan(
        @PathVariable Long id,
        @RequestHeader("sessionId") String sessionId,
        @RequestBody Map<String, Object> request) {
    try {
        User user = getUserFromSession(sessionId);
        LoanAccount loanAccount = loanAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan account not found"));
        
        // Verify ownership of loan account
        if (!loanAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        Double amount = ((Number) request.get("amount")).doubleValue();
        Long destinationAccountId = ((Number) request.get("destinationAccountId")).longValue();
        
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid transfer amount"));
        }
        
        double availableToBorrow = loanAccount.getApprovedAmount() - loanAccount.getOutstandingBalance();
        if (amount > availableToBorrow) {
        return ResponseEntity.badRequest().body(Map.of("error", "Transfer amount exceeds available credit"));
   }
        // Find the destination account (you need to add an AccountRepository)
        // This assumes you have an Account entity and repository
        Account destinationAccount = accountRepository.findById(destinationAccountId)
                .orElseThrow(() -> new RuntimeException("Destination account not found"));
        
        // Verify destination account belongs to the same user
        if (!destinationAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot transfer to another user's account"));
        }

   // Calculate interest (2.5% of transferred amount)
double interest = amount * 0.025;
double totalDue = amount + interest;

// Perform the transfer - money goes to destination, interest stays in loan
loanAccount.setOutstandingBalance(loanAccount.getOutstandingBalance() + totalDue);
destinationAccount.setBalance(destinationAccount.getBalance() + amount);

  // Save both accounts
loanAccountRepository.save(loanAccount);
accountRepository.save(destinationAccount);


// Create transaction record for loan account (showing total due)
Transaction loanTransaction = new Transaction();
loanTransaction.setAccountId(loanAccount.getId());
loanTransaction.setAmount(totalDue);
loanTransaction.setType("TRANSFER_OUT");
loanTransaction.setBalanceAfter(loanAccount.getOutstandingBalance());
loanTransaction.setTimestamp(LocalDateTime.now());
loanTransaction.setTargetAccountId(destinationAccountId);
loanTransaction.setDescription("Transfer of $" + String.format("%.2f", amount) + " + 2.5% interest ($" + String.format("%.2f", interest) + ")");
loanTransaction.setCategory("TRANSFER");

// ADD THESE DEBUG LINES
System.out.println("=== SAVING LOAN TRANSACTION ===");
System.out.println("Loan Account ID: " + loanAccount.getId());
System.out.println("Amount: " + amount);
System.out.println("Type: TRANSFER_OUT");
System.out.println("Balance After: " + loanAccount.getOutstandingBalance());
System.out.println("Target Account: " + destinationAccountId);

Transaction savedLoanTx = transactionRepository.save(loanTransaction);
System.out.println("Saved Transaction ID: " + savedLoanTx.getId());
System.out.println("=== DONE ===");

// Create transaction record for destination account (money arriving)
Transaction destTransaction = new Transaction();
destTransaction.setAccountId(destinationAccountId);
destTransaction.setAmount(amount);
destTransaction.setType("TRANSFER_IN");
destTransaction.setBalanceAfter(destinationAccount.getBalance());
destTransaction.setTimestamp(LocalDateTime.now());
destTransaction.setTargetAccountId(loanAccount.getId());
destTransaction.setDescription("Transfer from Loan account");
destTransaction.setCategory("TRANSFER");
transactionRepository.save(destTransaction);

return ResponseEntity.ok(Map.of(
    "success", true,
    "message", "Transfer successful",
    "newLoanBalance", loanAccount.getOutstandingBalance(),
    "newDestinationBalance", destinationAccount.getBalance()
));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
/**
 * GET /api/loan/accounts/{id}/payments
 * Get payment history for loan
 */
/**
 * GET /api/loan/accounts/{id}/payments
 * Get payment history for loan
 */
@GetMapping("/accounts/{id}/payments")
public ResponseEntity<?> getPaymentHistory(
        @PathVariable Long id,
        @RequestHeader("sessionId") String sessionId) {
    try {
        User user = getUserFromSession(sessionId);
        LoanAccount loanAccount = loanAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan account not found"));
        
        // Verify ownership
        if (!loanAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        // Get real payment transactions from transaction repository
        // Get both PAYMENT and TRANSFER_OUT transactions for loan account
      List<Transaction> payments = transactionRepository.findByAccountIdAndTypeInOrderByTimestampDesc(
       loanAccount.getId(), List.of("PAYMENT", "TRANSFER_OUT"));
        
        // Transform to the format expected by frontend
        List<Map<String, Object>> response = payments.stream().map(payment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", payment.getId());
            map.put("date", payment.getTimestamp());
            map.put("amount", payment.getAmount());
            map.put("description", payment.getDescription());
            map.put("balanceAfter", payment.getBalanceAfter());
            map.put("type", payment.getType());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

/**
 * POST /api/loan/accounts/{id}/payment
 * Make a payment on a loan from a selected account
 */
@PostMapping("/accounts/{id}/payment")
public ResponseEntity<?> makePayment(
        @PathVariable Long id,
        @RequestHeader("sessionId") String sessionId,
        @RequestBody Map<String, Object> request) {
    try {
        User user = getUserFromSession(sessionId);
        LoanAccount loanAccount = loanAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan account not found"));
        
        // Verify ownership
        if (!loanAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        Double amount = ((Number) request.get("amount")).doubleValue();
        Long fromAccountId = ((Number) request.get("fromAccountId")).longValue();
        
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid payment amount"));
        }
        
        // FIXED: Check against outstanding balance, not available credit
        if (amount > loanAccount.getOutstandingBalance()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment exceeds outstanding balance"));
        }
        
        // Find the source account (where money comes FROM)
        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        // Verify source account belongs to the same user
        if (!fromAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot pay from another user's account"));
        }
        
        // Check if source account has enough money
        if (fromAccount.getBalance() < amount) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds in selected account"));
        }
        
        // Perform the payment - debit from source account, credit to loan (reduce loan balance)
        fromAccount.setBalance(fromAccount.getBalance() - amount);
        loanAccount.setOutstandingBalance(loanAccount.getOutstandingBalance() - amount);
        
        // Save both accounts
        accountRepository.save(fromAccount);
        loanAccountRepository.save(loanAccount);
        
        // Create transaction record for source account (money leaving)
        Transaction sourceTransaction = new Transaction();
        sourceTransaction.setAccountId(fromAccountId);
        sourceTransaction.setAmount(amount);
        sourceTransaction.setType("TRANSFER_OUT");
        sourceTransaction.setBalanceAfter(fromAccount.getBalance());
        sourceTransaction.setTimestamp(LocalDateTime.now());
        sourceTransaction.setTargetAccountId(loanAccount.getId());
        sourceTransaction.setDescription("Payment to Loan account");
        sourceTransaction.setCategory("LOAN_PAYMENT");
        transactionRepository.save(sourceTransaction);
        
        // Create transaction record for loan account (money arriving - payment received)
        Transaction loanTransaction = new Transaction();
        loanTransaction.setAccountId(loanAccount.getId());
        loanTransaction.setAmount(amount);
        loanTransaction.setType("PAYMENT");
        loanTransaction.setBalanceAfter(loanAccount.getOutstandingBalance());
        loanTransaction.setTimestamp(LocalDateTime.now());
        loanTransaction.setTargetAccountId(fromAccountId);
        loanTransaction.setDescription("Loan payment received from " + fromAccount.getAccountType());
        loanTransaction.setCategory("LOAN_PAYMENT");
        transactionRepository.save(loanTransaction);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Payment successful",
            "newBalance", loanAccount.getOutstandingBalance(),
            "fromAccountBalance", fromAccount.getBalance()
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
    }
}

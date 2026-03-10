package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teller")
public class TellerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private LoanAccountRepository loanAccountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * GET /api/teller/search/users?query=
     * Search users by name
     */
    @GetMapping("/search/users")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        try {
            System.out.println("=== TELLER SEARCH ===");
            System.out.println("Search query: " + query);

            List<User> users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);

            System.out.println("Found " + users.size() + " users");

            List<Map<String, Object>> response = users.stream().map(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("firstName", user.getFirstName());
                map.put("lastName", user.getLastName());
                map.put("email", user.getEmail());
                map.put("fullName", user.getFullName());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ERROR in searchUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/teller/user/{userId}/accounts
     * Get all accounts for a specific user
     */
    @GetMapping("/user/{userId}/accounts")
    public ResponseEntity<?> getUserAccounts(@PathVariable Long userId) {
        try {
            System.out.println("=== GET USER ACCOUNTS ===");
            System.out.println("User ID: " + userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get regular accounts (checking/savings)
            List<Account> regularAccounts = accountRepository.findByUserId(userId);

            // Get credit accounts
            List<CreditAccount> creditAccounts = creditAccountRepository.findByUserId(userId);

            // Get loan accounts
            List<LoanAccount> loanAccounts = loanAccountRepository.findByUserId(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("userName", user.getFullName());
            response.put("userEmail", user.getEmail());

            // Regular accounts
            List<Map<String, Object>> regularList = regularAccounts.stream().map(acc -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", acc.getId());
                map.put("type", acc.getAccountType());
                map.put("accountNumber", acc.getMaskedAccountNumber());
                map.put("balance", acc.getBalance());
                map.put("isCredit", false);
                map.put("isLoan", false);
                return map;
            }).collect(Collectors.toList());

            // Credit accounts
            List<Map<String, Object>> creditList = creditAccounts.stream().map(acc -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", acc.getId());
                map.put("type", "CREDIT");
                map.put("accountNumber", acc.getMaskedAccountNumber());
                map.put("balance", acc.getCurrentBalance());
                map.put("creditLimit", acc.getCreditLimit());
                map.put("availableCredit", acc.getAvailableCredit());
                map.put("isCredit", true);
                map.put("isLoan", false);
                return map;
            }).collect(Collectors.toList());

            // Loan accounts
            List<Map<String, Object>> loanList = loanAccounts.stream().map(loan -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", loan.getId());
                map.put("type", "LOAN");
                map.put("accountNumber", loan.getMaskedAccountNumber());
                map.put("balance", loan.getOutstandingBalance());
                map.put("originalAmount", loan.getApprovedAmount());
                map.put("interestRate", loan.getInterestRate());
                map.put("isCredit", false);
                map.put("isLoan", true);
                return map;
            }).collect(Collectors.toList());

            response.put("regularAccounts", regularList);
            response.put("creditAccounts", creditList);
            response.put("loanAccounts", loanList);

            System.out.println("Found " + regularList.size() + " regular accounts, " + 
                              creditList.size() + " credit accounts, and " + 
                              loanList.size() + " loan accounts");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ERROR in getUserAccounts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/teller/deposit
     * Deposit money into any user account
     */
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== TELLER DEPOSIT ===");
            
            Long userId = ((Number) request.get("userId")).longValue();
            Long accountId = ((Number) request.get("accountId")).longValue();
            Double amount = ((Number) request.get("amount")).doubleValue();
            String note = (String) request.get("note");

            System.out.println("User ID: " + userId);
            System.out.println("Account ID: " + accountId);
            System.out.println("Amount: " + amount);

            @SuppressWarnings("unused")
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check account type
            Account regularAccount = accountRepository.findById(accountId).orElse(null);
            CreditAccount creditAccount = creditAccountRepository.findById(accountId).orElse(null);
            LoanAccount loanAccount = loanAccountRepository.findById(accountId).orElse(null);

            double newBalance = 0;
            String transactionType = "";
            String description = "";

            if (regularAccount != null) {
                // Regular account deposit
                regularAccount.setBalance(regularAccount.getBalance() + amount);
                accountRepository.save(regularAccount);
                newBalance = regularAccount.getBalance();
                transactionType = "TELLER_DEPOSIT";
                description = "Teller deposit" + (note != null ? ": " + note : "");

            } else if (creditAccount != null) {
                // Credit account payment (deposit reduces debt)
                creditAccount.setCurrentBalance(creditAccount.getCurrentBalance() - amount);
                creditAccountRepository.save(creditAccount);
                newBalance = creditAccount.getCurrentBalance();
                transactionType = "TELLER_PAYMENT";
                description = "Teller payment" + (note != null ? ": " + note : "");

            } else if (loanAccount != null) {
                // Loan account payment (deposit reduces debt)
                loanAccount.setOutstandingBalance(loanAccount.getOutstandingBalance() - amount);
                loanAccountRepository.save(loanAccount);
                newBalance = loanAccount.getOutstandingBalance();
                transactionType = "TELLER_LOAN_PAYMENT";
                description = "Teller loan payment" + (note != null ? ": " + note : "");

            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Account not found"));
            }

            // Create transaction record
            Transaction transaction = new Transaction();
            transaction.setAccountId(accountId);
            transaction.setAmount(amount);
            transaction.setType(transactionType);
            transaction.setBalanceAfter(newBalance);
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setDescription(description);
            transaction.setCategory("DEPOSIT");
            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Deposit successful",
                "newBalance", newBalance,
                "userId", userId,
                "accountId", accountId
            ));

        } catch (Exception e) {
            System.out.println("ERROR in deposit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/teller/withdraw
     * Withdraw money from any user account
     */
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== TELLER WITHDRAW ===");
            
            Long userId = ((Number) request.get("userId")).longValue();
            Long accountId = ((Number) request.get("accountId")).longValue();
            Double amount = ((Number) request.get("amount")).doubleValue();
            String note = (String) request.get("note");

            System.out.println("User ID: " + userId);
            System.out.println("Account ID: " + accountId);
            System.out.println("Amount: " + amount);

            @SuppressWarnings("unused")
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Account regularAccount = accountRepository.findById(accountId).orElse(null);
            CreditAccount creditAccount = creditAccountRepository.findById(accountId).orElse(null);
            LoanAccount loanAccount = loanAccountRepository.findById(accountId).orElse(null);

            double newBalance = 0;
            String transactionType = "";
            String description = "";

            if (regularAccount != null) {
                // Regular account withdrawal - check funds
                if (regularAccount.getBalance() < amount) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds"));
                }
                regularAccount.setBalance(regularAccount.getBalance() - amount);
                accountRepository.save(regularAccount);
                newBalance = regularAccount.getBalance();
                transactionType = "TELLER_WITHDRAWAL";
                description = "Teller withdrawal" + (note != null ? ": " + note : "");

            } else if (creditAccount != null) {
                // Credit account cash advance - check available credit
                if (creditAccount.getAvailableCredit() < amount) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Insufficient available credit"));
                }
                creditAccount.setCurrentBalance(creditAccount.getCurrentBalance() + amount);
                creditAccountRepository.save(creditAccount);
                newBalance = creditAccount.getCurrentBalance();
                transactionType = "TELLER_CASH_ADVANCE";
                description = "Teller cash advance" + (note != null ? ": " + note : "");

            } else if (loanAccount != null) {
                // Loan account borrow more - check if loan is active
                if (!"ACTIVE".equals(loanAccount.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Loan is not active"));
                }
                loanAccount.setOutstandingBalance(loanAccount.getOutstandingBalance() + amount);
                loanAccountRepository.save(loanAccount);
                newBalance = loanAccount.getOutstandingBalance();
                transactionType = "TELLER_LOAN_DISBURSEMENT";
                description = "Teller loan disbursement" + (note != null ? ": " + note : "");

            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Account not found"));
            }

            // Create transaction record
            Transaction transaction = new Transaction();
            transaction.setAccountId(accountId);
            transaction.setAmount(amount);
            transaction.setType(transactionType);
            transaction.setBalanceAfter(newBalance);
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setDescription(description);
            transaction.setCategory("WITHDRAWAL");
            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Withdrawal successful",
                "newBalance", newBalance,
                "userId", userId,
                "accountId", accountId
            ));

        } catch (Exception e) {
            System.out.println("ERROR in withdraw: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/teller/transfer
     * Transfer money between user's accounts
     */
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== TELLER TRANSFER ===");
            
            Long userId = ((Number) request.get("userId")).longValue();
            Long fromAccountId = ((Number) request.get("fromAccountId")).longValue();
            Long toAccountId = ((Number) request.get("toAccountId")).longValue();
            Double amount = ((Number) request.get("amount")).doubleValue();
            String note = (String) request.get("note");

            System.out.println("User ID: " + userId);
            System.out.println("From Account: " + fromAccountId);
            System.out.println("To Account: " + toAccountId);
            System.out.println("Amount: " + amount);

            @SuppressWarnings("unused")
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get source account
            Account fromRegular = accountRepository.findById(fromAccountId).orElse(null);
            CreditAccount fromCredit = creditAccountRepository.findById(fromAccountId).orElse(null);
            LoanAccount fromLoan = loanAccountRepository.findById(fromAccountId).orElse(null);

            // Get destination account
            Account toRegular = accountRepository.findById(toAccountId).orElse(null);
            CreditAccount toCredit = creditAccountRepository.findById(toAccountId).orElse(null);
            LoanAccount toLoan = loanAccountRepository.findById(toAccountId).orElse(null);

            if (fromRegular == null && fromCredit == null && fromLoan == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Source account not found"));
            }
            if (toRegular == null && toCredit == null && toLoan == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Destination account not found"));
            }

            // Process withdrawal from source account
            if (fromRegular != null) {
                if (fromRegular.getBalance() < amount) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds in source account"));
                }
                fromRegular.setBalance(fromRegular.getBalance() - amount);
                accountRepository.save(fromRegular);
            } else if (fromCredit != null) {
                if (fromCredit.getAvailableCredit() < amount) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Insufficient available credit"));
                }
                fromCredit.setCurrentBalance(fromCredit.getCurrentBalance() + amount);
                creditAccountRepository.save(fromCredit);
            } else if (fromLoan != null) {
                if (!"ACTIVE".equals(fromLoan.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Loan is not active"));
                }
                fromLoan.setOutstandingBalance(fromLoan.getOutstandingBalance() + amount);
                loanAccountRepository.save(fromLoan);
            }

            // Process deposit to destination account
            if (toRegular != null) {
                toRegular.setBalance(toRegular.getBalance() + amount);
                accountRepository.save(toRegular);
            } else if (toCredit != null) {
                toCredit.setCurrentBalance(toCredit.getCurrentBalance() - amount);
                creditAccountRepository.save(toCredit);
            } else if (toLoan != null) {
                toLoan.setOutstandingBalance(toLoan.getOutstandingBalance() - amount);
                loanAccountRepository.save(toLoan);
            }

            // Get final balances for transaction records
            @SuppressWarnings("null")
            double fromBalance = fromRegular != null ? fromRegular.getBalance() :
                                fromCredit != null ? fromCredit.getCurrentBalance() :
                                fromLoan.getOutstandingBalance();
            
            @SuppressWarnings("null")
            double toBalance = toRegular != null ? toRegular.getBalance() :
                              toCredit != null ? toCredit.getCurrentBalance() :
                              toLoan.getOutstandingBalance();

            // Create transaction for source account
            Transaction fromTransaction = new Transaction();
            fromTransaction.setAccountId(fromAccountId);
            fromTransaction.setAmount(amount);
            fromTransaction.setType("TELLER_TRANSFER_OUT");
            fromTransaction.setBalanceAfter(fromBalance);
            fromTransaction.setTimestamp(LocalDateTime.now());
            fromTransaction.setTargetAccountId(toAccountId);
            fromTransaction.setDescription("Teller transfer" + (note != null ? ": " + note : ""));
            fromTransaction.setCategory("TRANSFER");
            transactionRepository.save(fromTransaction);

            // Create transaction for destination account
            Transaction toTransaction = new Transaction();
            toTransaction.setAccountId(toAccountId);
            toTransaction.setAmount(amount);
            toTransaction.setType("TELLER_TRANSFER_IN");
            toTransaction.setBalanceAfter(toBalance);
            toTransaction.setTimestamp(LocalDateTime.now());
            toTransaction.setTargetAccountId(fromAccountId);
            toTransaction.setDescription("Teller transfer received" + (note != null ? ": " + note : ""));
            toTransaction.setCategory("TRANSFER");
            transactionRepository.save(toTransaction);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Transfer successful",
                "userId", userId,
                "fromAccountId", fromAccountId,
                "toAccountId", toAccountId
            ));

        } catch (Exception e) {
            System.out.println("ERROR in transfer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

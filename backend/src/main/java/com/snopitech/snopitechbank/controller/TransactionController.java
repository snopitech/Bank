package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TransactionController {

    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    public TransactionController(TransactionService transactionService,
                                 AccountRepository accountRepository) {
        this.transactionService = transactionService;
        this.accountRepository = accountRepository;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAccount(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccountId(accountId));
    }

    // ⭐ NEW: Get transactions by account number
    @GetMapping("/accounts/transactions/account-number")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAccountNumber(
            @RequestParam String accountNumber
    ) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(
                transactionService.getTransactionsByAccountId(account.getId())
        );
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping("/transactions")
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO dto) {
        return ResponseEntity.ok(transactionService.createTransaction(dto));
    }

    @GetMapping("/transactions/filter")
    public ResponseEntity<Page<TransactionDTO>> filterTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                transactionService.filterTransactions(
                        type, startDate, endDate, minAmount, maxAmount, sort, page, size
                )
        );
    }

    @GetMapping("/accounts/{accountId}/transactions/filter")
    public ResponseEntity<Page<TransactionDTO>> filterTransactionsByAccount(
            @PathVariable Long accountId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                transactionService.filterTransactionsByAccount(
                        accountId, type, startDate, endDate, minAmount, maxAmount, sort, page, size
                )
        );
    }

    @DeleteMapping("/transactions/clear")
    public ResponseEntity<String> clearAllTransactions() {
        transactionService.clearAllTransactions();
        return ResponseEntity.ok("All transactions cleared successfully");
    }

    // ⭐ NEW - Clear transactions for a specific account by account number
    @DeleteMapping("/transactions/clear/by-account-number")
    public ResponseEntity<String> clearTransactionsByAccountNumber(
            @RequestParam String accountNumber
    ) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) {
            return ResponseEntity.status(404)
                    .body("Account not found with number: " + accountNumber);
        }
        
        transactionService.clearTransactionsByAccountId(account.getId());
        return ResponseEntity.ok("All transactions cleared for account: " + accountNumber);
    }
}
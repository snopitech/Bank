package com.snopitech.snopitechbank.service;
import java.util.Random;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.CreditTransaction;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.CreditTransactionRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CreditAccountServiceImpl {

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionService transactionService;
    
    /**
     * Transfer money FROM credit card TO any account (even non-existent ones)
     * This mirrors AccountService.transfer() but for credit accounts
     */
    @Transactional
    public CreditAccount transferFromCredit(
            Long creditAccountId,
            String recipientAccountNumber,
            Double amount,
            String description) {
        
        // Find credit account
        CreditAccount creditAccount = creditAccountRepository.findById(creditAccountId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        // Check available credit
        if (creditAccount.getAvailableCredit() < amount) {
            throw new RuntimeException("Insufficient credit available");
        }

        // REMOVED: Duplicate balance update - this is now handled by CreditTransactionService.recordTransfer()

        // Update all cards under this account
        for (CreditCard card : creditAccount.getCards()) {
            card.setCurrentBalance(creditAccount.getCurrentBalance());
            card.setAvailableCredit(creditAccount.getAvailableCredit());
            creditCardRepository.save(card);
        }

        // Try to find recipient account (may be null for deleted/test accounts)
        var recipientAccount = accountRepository.findByAccountNumber(recipientAccountNumber);
        
        // If recipient exists, credit them
        if (recipientAccount != null) {
            recipientAccount.setBalance(recipientAccount.getBalance() + amount);
            accountRepository.save(recipientAccount);

            // Create transaction for recipient (like AccountService does)
            com.snopitech.snopitechbank.dto.TransactionDTO recipientTx = 
                new com.snopitech.snopitechbank.dto.TransactionDTO();
            recipientTx.setAccountId(recipientAccount.getId());
            recipientTx.setAmount(amount);
            recipientTx.setType("DEPOSIT");
            recipientTx.setDescription(description != null ? 
                description + " (from credit card)" : 
                "Received from credit card");
            recipientTx.setTimestamp(LocalDateTime.now());
            
            transactionService.createTransaction(recipientTx);
        }

        // Create credit transaction record (this will update the balance once)
        CreditTransaction creditTx = new CreditTransaction();
        creditTx.setCreditAccount(creditAccount);
        creditTx.setAmount(amount);
        creditTx.setType("CREDIT_TRANSFER");
        creditTx.setStatus("COMPLETED");
        creditTx.setBalanceAfter(creditAccount.getCurrentBalance() + amount);
        creditTx.setReferenceNumber(generateReferenceNumber());
        
        String recipientDisplay = recipientAccount != null ? 
            recipientAccount.getOwnerName() : 
            "External Account";
        String desc = String.format("Transfer to %s (CDC) - Acct: %s", 
            recipientDisplay,
            recipientAccountNumber.substring(Math.max(0, recipientAccountNumber.length() - 4)));
        
        if (description != null && !description.isEmpty()) {
            desc += " - " + description;
        }
        
        creditTx.setDescription(desc);
        creditTx.setCategory("TRANSFER");
        creditTx.setMerchant(recipientDisplay);
        
        creditTransactionRepository.save(creditTx);

        return creditAccount;
    }

    /**
     * Pay credit card FROM another account
     * This mirrors a deposit/transfer into the credit account
     */
    @Transactional
    public CreditAccount payCreditCard(
            Long creditAccountId,
            Long sourceAccountId,
            Double amount,
            String description) {
        
        // Find credit account
        CreditAccount creditAccount = creditAccountRepository.findById(creditAccountId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        // Find source account (checking/savings/business)
        var sourceAccount = accountRepository.findById(sourceAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        // Check if source has sufficient funds
        if (sourceAccount.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds in source account");
        }

        // Withdraw from source account
        sourceAccount.setBalance(sourceAccount.getBalance() - amount);
        accountRepository.save(sourceAccount);

        // Update credit account balance (decrease debt)
        creditAccount.setCurrentBalance(creditAccount.getCurrentBalance() - amount);
        creditAccount = creditAccountRepository.save(creditAccount);

        // Update all cards under this account
        for (CreditCard card : creditAccount.getCards()) {
            card.setCurrentBalance(creditAccount.getCurrentBalance());
            card.setAvailableCredit(creditAccount.getAvailableCredit());
            creditCardRepository.save(card);
        }

        // Create transaction for source account (withdrawal)
        com.snopitech.snopitechbank.dto.TransactionDTO sourceTx = 
            new com.snopitech.snopitechbank.dto.TransactionDTO();
        sourceTx.setAccountId(sourceAccount.getId());
        sourceTx.setAmount(amount);
        sourceTx.setType("DEPOSIT"); 
        sourceTx.setDescription(description != null ? 
            description + " (to credit card)" : 
            "Payment to credit card");
        sourceTx.setTimestamp(LocalDateTime.now());
       
        transactionService.createTransaction(sourceTx);

        // Create credit transaction record (payment received)
        CreditTransaction creditTx = new CreditTransaction();
        creditTx.setCreditAccount(creditAccount);
        creditTx.setAmount(amount);
        creditTx.setType("PAYMENT");
        creditTx.setStatus("COMPLETED");
        creditTx.setBalanceAfter(creditAccount.getCurrentBalance());
        creditTx.setReferenceNumber(generateReferenceNumber());
        creditTx.setDescription(description != null ? 
            description + " (payment received)" : 
            "Payment received from " + sourceAccount.getOwnerName());
        creditTx.setCategory("PAYMENT");
        
        creditTransactionRepository.save(creditTx);

        return creditAccount;
    }
     
    

    private String generateReferenceNumber() {
        return "CRD-" + System.currentTimeMillis() + "-" + 
               String.format("%04d", new Random().nextInt(10000));
    }
    
}
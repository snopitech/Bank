package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.CreditTransaction;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.CreditTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@SuppressWarnings("unused")
@Service
public class CreditTransactionService {

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    // ==================== CREATE TRANSACTIONS ====================

    /**
     * Record a purchase made with a credit card
     */
    @Transactional
    public CreditTransaction recordPurchase(
            Long creditCardId, 
            Double amount, 
            String merchant,
            String category) {
        
        CreditCard card = creditCardRepository.findById(creditCardId)
            .orElseThrow(() -> new RuntimeException("Credit card not found"));
        
        CreditAccount account = card.getCreditAccount();
        
        // Check available credit
        if (account.getAvailableCredit() < amount) {
            throw new RuntimeException("Insufficient credit available");
        }
        
        // Update account balance
        account.setCurrentBalance(account.getCurrentBalance() + amount);
        creditAccountRepository.save(account);
        
        // Update card balance
        card.setCurrentBalance(account.getCurrentBalance());
        card.setAvailableCredit(account.getAvailableCredit());
        creditCardRepository.save(card);
        
        // Create transaction record
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(account);
        transaction.setCreditCard(card);
        transaction.setAmount(amount);
        transaction.setType("PURCHASE");
        transaction.setStatus("COMPLETED");
        transaction.setMerchant(merchant);
        transaction.setCategory(category);
        transaction.setBalanceAfter(account.getCurrentBalance());
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setAuthorizationCode(generateAuthCode());
        transaction.setDescription(String.format("Purchase at %s", merchant));
        
        return creditTransactionRepository.save(transaction);
    }

    /**
     * Record a payment made to a credit account
     */
    @Transactional
    public CreditTransaction recordPayment(
            Long creditAccountId, 
            Double amount,
            String paymentMethod) {
        
        CreditAccount account = creditAccountRepository.findById(creditAccountId)
            .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        // Update account balance
        account.setCurrentBalance(account.getCurrentBalance() - amount);
        creditAccountRepository.save(account);
        
        // Update all cards under this account
        for (CreditCard card : account.getCards()) {
            card.setCurrentBalance(account.getCurrentBalance());
            card.setAvailableCredit(account.getAvailableCredit());
            creditCardRepository.save(card);
        }
        
        // Create transaction record
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(account);
        transaction.setAmount(amount);
        transaction.setType("PAYMENT");
        transaction.setStatus("COMPLETED");
        transaction.setBalanceAfter(account.getCurrentBalance());
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setDescription(String.format("Payment received via %s", paymentMethod));
        
        return creditTransactionRepository.save(transaction);
    }
    
    /**
 * Record a transfer made from a credit card to another account
 */
@Transactional
public CreditTransaction recordTransfer(
        Long creditAccountId,
        Double amount,
        String recipientName,
        String recipientAccountNumber,
        String description) {
    
    System.out.println("🚨🚨🚨 RECORD TRANSFER CALLED 🚨🚨🚨");
    CreditAccount account = creditAccountRepository.findById(creditAccountId)
        .orElseThrow(() -> new RuntimeException("Credit account not found"));
    
    // Update account balance (increase debt) - THIS IS THE ONLY BALANCE UPDATE
    account.setCurrentBalance(account.getCurrentBalance() + amount);
    System.out.println("💰 BALANCE UPDATED TO: " + account.getCurrentBalance());
    creditAccountRepository.save(account);
    
    // Update all cards under this account
    for (CreditCard card : account.getCards()) {
        card.setCurrentBalance(account.getCurrentBalance());
        card.setAvailableCredit(account.getAvailableCredit());
        creditCardRepository.save(card);
    }
    
    // Create transaction record
    CreditTransaction transaction = new CreditTransaction();
    transaction.setCreditAccount(account);
    transaction.setAmount(amount);
    transaction.setType("PURCHASE");
    transaction.setStatus("COMPLETED");
    transaction.setBalanceAfter(account.getCurrentBalance());
    transaction.setReferenceNumber(generateReferenceNumber());
    transaction.setAuthorizationCode(generateAuthCode());
    
    // Build description with recipient info
    String desc = String.format("Transfer to %s (CDC) - Acct: %s", 
        recipientName, 
        recipientAccountNumber.substring(Math.max(0, recipientAccountNumber.length() - 4)));
    
    if (description != null && !description.isEmpty()) {
        desc += " - " + description;
    }
    
    transaction.setDescription(desc);
    transaction.setCategory("TRANSFER");
    transaction.setMerchant(recipientName);
    
    return creditTransactionRepository.save(transaction);
}


    /**
     * Record a fee (late fee, annual fee, etc.)
     */
    @Transactional
    public CreditTransaction recordFee(
            Long creditAccountId,
            Double amount,
            String feeType,
            String description) {
        
        CreditAccount account = creditAccountRepository.findById(creditAccountId)
            .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        account.setCurrentBalance(account.getCurrentBalance() + amount);
        creditAccountRepository.save(account);
        
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(account);
        transaction.setAmount(amount);
        transaction.setType("FEE");
        transaction.setStatus("COMPLETED");
        transaction.setBalanceAfter(account.getCurrentBalance());
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setDescription(description);
        transaction.setCategory(feeType);
        
        return creditTransactionRepository.save(transaction);
    }

    /**
     * Record interest charge
     */
    @Transactional
    public CreditTransaction recordInterest(Long creditAccountId, Double amount) {
        CreditAccount account = creditAccountRepository.findById(creditAccountId)
            .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        account.setCurrentBalance(account.getCurrentBalance() + amount);
        creditAccountRepository.save(account);
        
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(account);
        transaction.setAmount(amount);
        transaction.setType("INTEREST");
        transaction.setStatus("COMPLETED");
        transaction.setBalanceAfter(account.getCurrentBalance());
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setDescription("Monthly interest charge");
        
        return creditTransactionRepository.save(transaction);
    }

    /**
     * Record a refund
     */
    @Transactional
    public CreditTransaction recordRefund(
            Long creditAccountId,
            Double amount,
            String originalTransactionRef,
            String reason) {
        
        CreditAccount account = creditAccountRepository.findById(creditAccountId)
            .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        account.setCurrentBalance(account.getCurrentBalance() - amount);
        creditAccountRepository.save(account);
        
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(account);
        transaction.setAmount(amount);
        transaction.setType("REFUND");
        transaction.setStatus("COMPLETED");
        transaction.setBalanceAfter(account.getCurrentBalance());
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setDescription(String.format("Refund: %s", reason));
        transaction.setReferenceNumber(originalTransactionRef);
        
        return creditTransactionRepository.save(transaction);
    }

    // ==================== GET TRANSACTIONS ====================

    /**
     * Get all transactions for a credit account
     */
    public List<CreditTransaction> getAccountTransactions(Long accountId) {
        return creditTransactionRepository.findByCreditAccountIdOrderByTimestampDesc(accountId);
    }

    /**
     * Get paginated transactions for a credit account
     */
    public Page<CreditTransaction> getAccountTransactionsPaginated(
            Long accountId, 
            int page, 
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return creditTransactionRepository.findByCreditAccountId(accountId, pageable);
    }

    /**
     * Get transactions for a specific credit card
     */
    public List<CreditTransaction> getCardTransactions(Long cardId) {
        return creditTransactionRepository.findByCreditCardIdOrderByTimestampDesc(cardId);
    }

    /**
     * Get transactions by type (PURCHASE, PAYMENT, etc.)
     */
    public List<CreditTransaction> getTransactionsByType(Long accountId, String type) {
        return creditTransactionRepository.findByCreditAccountIdAndType(accountId, type);
    }

    /**
     * Get transactions by status
     */
    public List<CreditTransaction> getTransactionsByStatus(Long accountId, String status) {
        return creditTransactionRepository.findByCreditAccountIdAndStatus(accountId, status);
    }

    /**
     * Get transactions within a date range
     */
    public List<CreditTransaction> getTransactionsByDateRange(
            Long accountId,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return creditTransactionRepository.findByCreditAccountIdAndTimestampBetween(
            accountId, startDate, endDate);
    }

    /**
     * Get transactions by merchant
     */
    public List<CreditTransaction> getTransactionsByMerchant(Long accountId, String merchant) {
        return creditTransactionRepository.findByCreditAccountIdAndMerchantContainingIgnoreCase(
            accountId, merchant);
    }

    /**
     * Get transactions by category
     */
    public List<CreditTransaction> getTransactionsByCategory(Long accountId, String category) {
        return creditTransactionRepository.findByCreditAccountIdAndCategory(accountId, category);
    }

    /**
     * Filter transactions with multiple criteria
     */
    public Page<CreditTransaction> filterTransactions(
            Long accountId,
            String type,
            String status,
            String category,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            int page,
            int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        
        LocalDateTime start = null;
        LocalDateTime end = null;
        
        if (startDate != null && !startDate.isEmpty()) {
            start = LocalDateTime.parse(startDate + "T00:00:00");
        }
        
        if (endDate != null && !endDate.isEmpty()) {
            end = LocalDateTime.parse(endDate + "T23:59:59");
        }
        
        return creditTransactionRepository.filterTransactions(
            accountId, type, status, category, start, end, minAmount, maxAmount, pageable);
    }

    /**
     * Get transaction by reference number
     */
    public CreditTransaction getTransactionByReference(String referenceNumber) {
        return creditTransactionRepository.findByReferenceNumber(referenceNumber);
    }

    /**
     * Get recent transactions
     */
    public List<CreditTransaction> getRecentTransactions(Long accountId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return creditTransactionRepository.findRecentTransactions(accountId, pageable);
    }
     /**
 * Get transaction by ID
 */
public CreditTransaction getTransactionById(Long id) {
    return creditTransactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
}
    // ==================== TRANSACTION STATUS UPDATES ====================

    /**
     * Update transaction status
     */
    @Transactional
    public CreditTransaction updateTransactionStatus(Long transactionId, String status) {
        CreditTransaction transaction = creditTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        transaction.setStatus(status);
        return creditTransactionRepository.save(transaction);
    }

    /**
     * Reverse a transaction (for disputes)
     */
    @Transactional
    public CreditTransaction reverseTransaction(Long transactionId, String reason) {
        CreditTransaction original = creditTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Create reversal transaction
        CreditTransaction reversal = new CreditTransaction();
        reversal.setCreditAccount(original.getCreditAccount());
        reversal.setAmount(original.getAmount());
        reversal.setType("REVERSAL");
        reversal.setStatus("COMPLETED");
        reversal.setDescription(String.format("Reversal of transaction %s: %s", 
            original.getReferenceNumber(), reason));
        reversal.setReferenceNumber(generateReferenceNumber());
        
        // Update account balance
        CreditAccount account = original.getCreditAccount();
        if ("PURCHASE".equals(original.getType())) {
            account.setCurrentBalance(account.getCurrentBalance() - original.getAmount());
        } else if ("PAYMENT".equals(original.getType())) {
            account.setCurrentBalance(account.getCurrentBalance() + original.getAmount());
        }
        
        reversal.setBalanceAfter(account.getCurrentBalance());
        creditAccountRepository.save(account);
        
        return creditTransactionRepository.save(reversal);
    }

    // ==================== STATISTICS ====================

    /**
     * Get transaction statistics for an account
     */
    public TransactionStatistics getTransactionStatistics(Long accountId) {
        TransactionStatistics stats = new TransactionStatistics();
        
        stats.setTotalTransactions(creditTransactionRepository.countByAccountId(accountId));
        stats.setTotalPurchases(creditTransactionRepository.totalPurchasesByAccountId(accountId));
        stats.setTotalPayments(creditTransactionRepository.totalPaymentsByAccountId(accountId));
        
        return stats;
    }

    // ==================== HELPER METHODS ====================

    private String generateReferenceNumber() {
        return "CRD-" + System.currentTimeMillis() + "-" + 
               String.format("%04d", new Random().nextInt(10000));
    }

    private String generateAuthCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    // ==================== INNER CLASS ====================

    public static class TransactionStatistics {
        private long totalTransactions;
        private Double totalPurchases;
        private Double totalPayments;

        public long getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(long totalTransactions) { 
            this.totalTransactions = totalTransactions; 
        }

        public Double getTotalPurchases() { return totalPurchases; }
        public void setTotalPurchases(Double totalPurchases) { 
            this.totalPurchases = totalPurchases; 
        }
        
        public Double getTotalPayments() { return totalPayments; }
        public void setTotalPayments(Double totalPayments) { 
            this.totalPayments = totalPayments; 
        }
    }
        /**
 * Clear all transactions for a credit account
 */
@Transactional
public void clearTransactionsByAccountId(Long accountId) {
    List<CreditTransaction> transactions = creditTransactionRepository.findByCreditAccountIdOrderByTimestampDesc(accountId);
    if (!transactions.isEmpty()) {
        creditTransactionRepository.deleteAll(transactions);
    }
}
}
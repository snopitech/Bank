package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    
    // Find by credit account
    List<CreditTransaction> findByCreditAccountIdOrderByTimestampDesc(Long creditAccountId);
    Page<CreditTransaction> findByCreditAccountId(Long creditAccountId, Pageable pageable);
    
    // Find by credit card
    List<CreditTransaction> findByCreditCardIdOrderByTimestampDesc(Long creditCardId);
    
    // Find by type
    List<CreditTransaction> findByCreditAccountIdAndType(Long creditAccountId, String type);
    
    // Find by status
    List<CreditTransaction> findByCreditAccountIdAndStatus(Long creditAccountId, String status);
    
    // Find by date range
    List<CreditTransaction> findByCreditAccountIdAndTimestampBetween(
        Long creditAccountId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    // Find by merchant
    List<CreditTransaction> findByCreditAccountIdAndMerchantContainingIgnoreCase(
        Long creditAccountId, 
        String merchant
    );
    
    // Find by category
    List<CreditTransaction> findByCreditAccountIdAndCategory(
        Long creditAccountId, 
        String category
    );
    
    // Find by reference number
    CreditTransaction findByReferenceNumber(String referenceNumber);
    
    // ADD THIS ONE LINE - Delete all transactions for a credit account
    void deleteByCreditAccountId(Long creditAccountId);
    
    // Complex query with filters
    @Query("SELECT t FROM CreditTransaction t WHERE t.creditAccount.id = :accountId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:startDate IS NULL OR t.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR t.timestamp <= :endDate) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount)")
    Page<CreditTransaction> filterTransactions(
        @Param("accountId") Long accountId,
        @Param("type") String type,
        @Param("status") String status,
        @Param("category") String category,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("minAmount") Double minAmount,
        @Param("maxAmount") Double maxAmount,
        Pageable pageable
    );
    
    // Get recent transactions
    @Query("SELECT t FROM CreditTransaction t WHERE t.creditAccount.id = :accountId " +
           "ORDER BY t.timestamp DESC")
    List<CreditTransaction> findRecentTransactions(
        @Param("accountId") Long accountId, 
        Pageable pageable
    );
    
    // Get transaction statistics
    @Query("SELECT COUNT(t) FROM CreditTransaction t WHERE t.creditAccount.id = :accountId")
    long countByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT SUM(t.amount) FROM CreditTransaction t WHERE t.creditAccount.id = :accountId " +
           "AND t.type = 'PURCHASE' AND t.status = 'COMPLETED'")
    Double totalPurchasesByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT SUM(t.amount) FROM CreditTransaction t WHERE t.creditAccount.id = :accountId " +
           "AND t.type = 'PAYMENT' AND t.status = 'COMPLETED'")
    Double totalPaymentsByAccountId(@Param("accountId") Long accountId);
}
package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ADD THIS METHOD
    List<Transaction> findByAccountId(Long accountId);

    List<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId);

    

    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId AND t.timestamp BETWEEN :startDate AND :endDate ORDER BY t.timestamp DESC")
    List<Transaction> findTransactionsByDateRange(@Param("accountId") Long accountId, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    List<Transaction> findByAccountIdAndTypeOrderByTimestampDesc(Long accountId, String type);

    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId " +
           "AND t.timestamp BETWEEN :startDate AND :endDate " +
           "AND (:type IS NULL OR t.type = :type) " +
           "ORDER BY t.timestamp DESC")
    List<Transaction> findFilteredTransactions(
        @Param("accountId") Long accountId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("type") String type);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.accountId = :accountId AND t.timestamp BETWEEN :startDate AND :endDate")
    int countByAccountIdAndTimestampBetween(@Param("accountId") Long accountId, 
                                             @Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);
}
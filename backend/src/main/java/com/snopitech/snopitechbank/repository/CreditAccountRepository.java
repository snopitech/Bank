package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditAccountRepository extends JpaRepository<CreditAccount, Long> {
    
    // Find by user
    List<CreditAccount> findByUser(User user);
    
    List<CreditAccount> findByUserId(Long userId);
    
    // Find by account number
    Optional<CreditAccount> findByAccountNumber(String accountNumber);
    
    // Find by status
    List<CreditAccount> findByStatus(String status);
    
    // Find active accounts for user
    List<CreditAccount> findByUserIdAndStatus(Long userId, String status);
    
    // Find accounts with balance > 0 (users with outstanding balance)
    List<CreditAccount> findByCurrentBalanceGreaterThan(Double balance);
    
    // Find accounts with available credit less than threshold
    List<CreditAccount> findByAvailableCreditLessThan(Double threshold);
    
    // Custom query for accounts needing attention (high utilization)
    @Query("SELECT ca FROM CreditAccount ca WHERE " +
           "(ca.currentBalance / ca.creditLimit) > :utilizationThreshold")
    List<CreditAccount> findHighUtilizationAccounts(@Param("utilizationThreshold") Double threshold);
    
    // Find accounts by credit limit range
    List<CreditAccount> findByCreditLimitBetween(Double minLimit, Double maxLimit);
    
    // Find accounts opened between dates
    List<CreditAccount> findByOpenedDateBetween(
            java.time.LocalDateTime startDate, 
            java.time.LocalDateTime endDate);
    
    // Count accounts by status
    @Query("SELECT ca.status, COUNT(ca) FROM CreditAccount ca GROUP BY ca.status")
    List<Object[]> countAccountsByStatus();
    
    // Get total outstanding balance across all accounts
    @Query("SELECT SUM(ca.currentBalance) FROM CreditAccount ca WHERE ca.status = 'ACTIVE'")
    Double getTotalOutstandingBalance();
    
    // Get average credit limit
    @Query("SELECT AVG(ca.creditLimit) FROM CreditAccount ca WHERE ca.status = 'ACTIVE'")
    Double getAverageCreditLimit();
    
    // Find accounts with payment due soon (based on paymentDueDay)
    @Query("SELECT ca FROM CreditAccount ca WHERE " +
           "ca.status = 'ACTIVE' AND ca.currentBalance > 0 AND " +
           "ca.paymentDueDay BETWEEN :startDay AND :endDay")
    List<CreditAccount> findAccountsWithPaymentDueBetween(
            @Param("startDay") Integer startDay, 
            @Param("endDay") Integer endDay);
    
    // Check if user has any active accounts
    boolean existsByUserIdAndStatus(Long userId, String status);
    
    // Find accounts that can request increase (not at max limit)
    @Query("SELECT ca FROM CreditAccount ca WHERE ca.increaseCount < 4")
    List<CreditAccount> findAccountsEligibleForIncrease();
}
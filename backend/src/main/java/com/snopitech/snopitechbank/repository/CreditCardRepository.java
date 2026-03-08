package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    
    // Find by credit account
    List<CreditCard> findByCreditAccount(CreditAccount creditAccount);
    
    List<CreditCard> findByCreditAccountId(Long accountId);
    
    // Find by card number (exact match)
    Optional<CreditCard> findByCardNumber(String cardNumber);
    
    // Find by card number ignoring dashes (NEW)
    @Query("SELECT cc FROM CreditCard cc WHERE REPLACE(cc.cardNumber, '-', '') = :cleanCardNumber")
    Optional<CreditCard> findByCleanCardNumber(@Param("cleanCardNumber") String cleanCardNumber);
    
    // Find by card type (PHYSICAL or VIRTUAL)
    List<CreditCard> findByCardType(String cardType);
    
    // Find by status
    List<CreditCard> findByStatus(String status);
    
    // Find active cards for account
    List<CreditCard> findByCreditAccountIdAndStatus(Long accountId, String status);
    
    // Find virtual cards for account
    List<CreditCard> findByCreditAccountIdAndIsVirtualTrue(Long accountId);
    
    // Find physical cards for account
    List<CreditCard> findByCreditAccountIdAndIsVirtualFalse(Long accountId);
    
    // Check if card number exists
    boolean existsByCardNumber(String cardNumber);
    
    // Find cards expiring soon
    @Query("SELECT cc FROM CreditCard cc WHERE cc.expiryDate BETWEEN :startDate AND :endDate")
    List<CreditCard> findCardsExpiringBetween(
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
    
    // Find expired cards
    @Query("SELECT cc FROM CreditCard cc WHERE cc.expiryDate < :currentDate")
    List<CreditCard> findExpiredCards(@Param("currentDate") java.time.LocalDate currentDate);
    
    // Find cards with failed PIN attempts
    List<CreditCard> findByFailedPinAttemptsGreaterThan(Integer attempts);
    
    // Find locked cards
    List<CreditCard> findByIsLockedTrue();
    
    // Find cards by reward type
    List<CreditCard> findByRewardType(String rewardType);
    
    // Custom query for cards with high balance
    @Query("SELECT cc FROM CreditCard cc WHERE " +
           "(cc.currentBalance / cc.creditLimit) > :utilizationThreshold")
    List<CreditCard> findHighUtilizationCards(@Param("utilizationThreshold") Double threshold);
    
    // Get total credit limit across all cards for an account
    @Query("SELECT SUM(cc.creditLimit) FROM CreditCard cc WHERE cc.creditAccount.id = :accountId")
    Double getTotalCreditLimitForAccount(@Param("accountId") Long accountId);
    
    // Get total balance across all cards for an account
    @Query("SELECT SUM(cc.currentBalance) FROM CreditCard cc WHERE cc.creditAccount.id = :accountId")
    Double getTotalBalanceForAccount(@Param("accountId") Long accountId);
    
    // Find replaced cards
    @Query("SELECT cc FROM CreditCard cc WHERE cc.replacedByCardId IS NOT NULL")
    List<CreditCard> findReplacedCards();
    
    // Find cards by replacement reason
    List<CreditCard> findByReplacementReason(String replacementReason);
    
    // Count cards by status for an account
    @Query("SELECT cc.status, COUNT(cc) FROM CreditCard cc " +
           "WHERE cc.creditAccount.id = :accountId GROUP BY cc.status")
    List<Object[]> countCardsByStatusForAccount(@Param("accountId") Long accountId);
    
    // Find cards issued between dates
    List<CreditCard> findByIssuedDateBetween(
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate);
    
    // Find recently used cards
    List<CreditCard> findByLastUsedDateAfter(java.time.LocalDateTime date);
}
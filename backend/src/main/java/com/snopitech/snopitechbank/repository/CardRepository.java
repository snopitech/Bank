package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    
    // Find all cards for a specific user (through account)
    @Query("SELECT c FROM Card c WHERE c.account.user.id = :userId")
    List<Card> findByUserId(@Param("userId") Long userId);

    
    
    // Find all cards for a specific account
    List<Card> findByAccountId(Long accountId);
    
    // Find cards by status
    List<Card> findByStatus(String status);
    
    // Find active cards for an account
    List<Card> findByAccountIdAndStatus(Long accountId, String status);
    
    // Find virtual cards
    List<Card> findByIsVirtualTrue();
    
    // Find physical cards
    List<Card> findByIsVirtualFalse();
    
    // Find by card number (for authentication/deposits)
    Optional<Card> findByCardNumber(String cardNumber);
    
    // Find expired cards - FIXED: using LocalDate.now() instead of CURRENT_DATE
    @Query("SELECT c FROM Card c WHERE c.expiryDate < :currentDate")
    List<Card> findExpiredCards(@Param("currentDate") LocalDate currentDate);
    
    // Find cards expiring soon (next 30 days) - FIXED: using parameter instead of date arithmetic in query
    @Query("SELECT c FROM Card c WHERE c.expiryDate BETWEEN :currentDate AND :futureDate")
    List<Card> findCardsExpiringSoon(@Param("currentDate") LocalDate currentDate, 
                                      @Param("futureDate") LocalDate futureDate);
    
    // Find locked cards
    List<Card> findByIsLockedTrue();
    
    // Count cards per account
    long countByAccountId(Long accountId);
    
    // Check if account has any active cards
    boolean existsByAccountIdAndStatus(Long accountId, String status);
    
    // Find active cards for a user
    @Query("SELECT c FROM Card c WHERE c.account.user.id = :userId AND c.status = 'ACTIVE'")
    List<Card> findActiveCardsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Card c WHERE REPLACE(c.cardNumber, '-', '') = :cleanCardNumber")
Optional<Card> findByCleanCardNumber(@Param("cleanCardNumber") String cleanCardNumber);

    
}
package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.BusinessAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessAccountRepository extends JpaRepository<BusinessAccount, Long> {

    // Find all business accounts for a user
    List<BusinessAccount> findByUserId(Long userId);

    // Find business account by EIN (Tax ID)
    Optional<BusinessAccount> findByEin(String ein);

    // Find business account by business name
    List<BusinessAccount> findByBusinessNameContainingIgnoreCase(String businessName);

    // Find by status
    List<BusinessAccount> findByStatus(String status);

    // Find by user and status
    List<BusinessAccount> findByUserIdAndStatus(Long userId, String status);

    // Find by industry
    List<BusinessAccount> findByIndustry(String industry);

    // Find verified businesses
    List<BusinessAccount> findByVerifiedTrue();

    // Find unverified businesses
    List<BusinessAccount> findByVerifiedFalse();

    // Find by account ID (the linked main account)
    Optional<BusinessAccount> findByAccountId(Long accountId);

    // UPDATED: Find business account by card ID (searches through the cards list)
    @Query("SELECT b FROM BusinessAccount b JOIN b.cards c WHERE c.id = :cardId")
    Optional<BusinessAccount> findByCardId(@Param("cardId") Long cardId);

    // Search businesses by name or EIN (for admin)
    @Query("SELECT b FROM BusinessAccount b WHERE " +
           "LOWER(b.businessName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "b.ein LIKE CONCAT('%', :searchTerm, '%')")
    List<BusinessAccount> searchBusinesses(@Param("searchTerm") String searchTerm);

    // Count businesses by user
    long countByUserId(Long userId);

    // Check if user has a business account with specific EIN
    boolean existsByUserIdAndEin(Long userId, String ein);

    // Get all businesses that need verification (pending)
    @Query("SELECT b FROM BusinessAccount b WHERE b.verified = false AND b.status = 'ACTIVE'")
    List<BusinessAccount> findPendingVerification();

    // Get business statistics by industry
    @Query("SELECT b.industry, COUNT(b) FROM BusinessAccount b GROUP BY b.industry")
    List<Object[]> getBusinessStatsByIndustry();

    // Find businesses with annual revenue greater than
    List<BusinessAccount> findByAnnualRevenueGreaterThan(Double revenue);

    // Find businesses by years in operation
    List<BusinessAccount> findByYearsInOperationGreaterThanEqual(Integer years);
    
}
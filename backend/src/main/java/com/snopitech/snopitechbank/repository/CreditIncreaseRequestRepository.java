package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditIncreaseRequest;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditIncreaseRequestRepository extends JpaRepository<CreditIncreaseRequest, Long> {
    
    // Find by user
    List<CreditIncreaseRequest> findByUser(User user);
    
    List<CreditIncreaseRequest> findByUserId(Long userId);
    
    // Find by credit account
    List<CreditIncreaseRequest> findByCreditAccount(CreditAccount creditAccount);
    
    List<CreditIncreaseRequest> findByCreditAccountId(Long accountId);
    
    // Find by status
    List<CreditIncreaseRequest> findByStatus(String status);
    
    // Find pending requests (for admin)
    List<CreditIncreaseRequest> findByStatusOrderBySubmittedDateDesc(String status);
    
    // Find pending requests for specific account
    List<CreditIncreaseRequest> findByCreditAccountIdAndStatus(Long accountId, String status);
    
    // Check if account has pending request
    boolean existsByCreditAccountIdAndStatus(Long accountId, String status);
    
    // Find user's requests by status
    List<CreditIncreaseRequest> findByUserIdAndStatus(Long userId, String status);
    
    // Find requests reviewed by specific admin
    List<CreditIncreaseRequest> findByReviewedBy(String reviewedBy);
    
    // Custom query for requests with filters
    @Query("SELECT cir FROM CreditIncreaseRequest cir WHERE " +
           "(:status IS NULL OR cir.status = :status) AND " +
           "(:accountId IS NULL OR cir.creditAccount.id = :accountId) " +
           "ORDER BY cir.submittedDate DESC")
    List<CreditIncreaseRequest> findRequestsWithFilters(
            @Param("status") String status, 
            @Param("accountId") Long accountId);
    
    // Count pending requests
    @Query("SELECT COUNT(cir) FROM CreditIncreaseRequest cir WHERE cir.status = 'PENDING'")
    long countPendingRequests();
    
    // Find requests submitted between dates
    List<CreditIncreaseRequest> findBySubmittedDateBetween(
            java.time.LocalDateTime startDate, 
            java.time.LocalDateTime endDate);
    
    // Find requests by requested limit
    List<CreditIncreaseRequest> findByRequestedLimit(Double requestedLimit);
    
    // Get all requests for an account ordered by submission date
    List<CreditIncreaseRequest> findByCreditAccountIdOrderBySubmittedDateDesc(Long accountId);
    
    // Find latest request for an account
    Optional<CreditIncreaseRequest> findTopByCreditAccountIdOrderBySubmittedDateDesc(Long accountId);
    
    // Find requests with credit score below threshold
    @Query("SELECT cir FROM CreditIncreaseRequest cir WHERE " +
           "cir.creditCheckPerformed = true AND cir.creditScore < :minScore")
    List<CreditIncreaseRequest> findRequestsWithLowCreditScore(@Param("minScore") Integer minScore);
    
    // Find requests pending document verification
    @Query("SELECT cir FROM CreditIncreaseRequest cir WHERE " +
           "cir.status = 'PENDING' AND cir.documentsVerified = false")
    List<CreditIncreaseRequest> findRequestsPendingDocumentVerification();
    
    // Count requests by status grouped by account
    @Query("SELECT cir.creditAccount.id, cir.status, COUNT(cir) " +
           "FROM CreditIncreaseRequest cir " +
           "GROUP BY cir.creditAccount.id, cir.status")
    List<Object[]> countRequestsByAccountAndStatus();
    
    // Find requests that were auto-approved/rejected based on criteria
    @Query("SELECT cir FROM CreditIncreaseRequest cir WHERE " +
           "cir.creditCheckPerformed = true AND cir.reviewedBy = 'SYSTEM'")
    List<CreditIncreaseRequest> findAutoProcessedRequests();
}

package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CreditApplication;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditApplicationRepository extends JpaRepository<CreditApplication, Long> {
    
    // Find by user
    List<CreditApplication> findByUser(User user);
    
    List<CreditApplication> findByUserId(Long userId);
    
    // Find by status
    List<CreditApplication> findByStatus(String status);
    
    // Find pending applications (for admin)
    List<CreditApplication> findByStatusOrderBySubmittedDateDesc(String status);
    
    // Find by application type
    List<CreditApplication> findByApplicationType(String applicationType);
    
    // Find user's applications by type
    List<CreditApplication> findByUserIdAndApplicationType(Long userId, String applicationType);
    
    // Check if user has pending application
    boolean existsByUserIdAndStatus(Long userId, String status);
    
    // Check if user has pending application of specific type
    boolean existsByUserIdAndApplicationTypeAndStatus(Long userId, String applicationType, String status);
    
    // Find latest application for user
    Optional<CreditApplication> findTopByUserIdOrderBySubmittedDateDesc(Long userId);
    
    // Find applications reviewed by specific admin
    List<CreditApplication> findByReviewedBy(String reviewedBy);
    
    // ⭐ NEW: Find applications by credit account ID (for deletion)
    List<CreditApplication> findByCreditAccountId(Long creditAccountId);

    // Add this method to find by userId AND status
    List<CreditApplication> findByUserIdAndStatus(Long userId, String status);
    
    // Custom query for applications with filters
    @Query("SELECT ca FROM CreditApplication ca WHERE " +
           "(:status IS NULL OR ca.status = :status) AND " +
           "(:type IS NULL OR ca.applicationType = :type) " +
           "ORDER BY ca.submittedDate DESC")
    List<CreditApplication> findApplicationsWithFilters(
            @Param("status") String status, 
            @Param("type") String type);
    
    // Count pending applications
    @Query("SELECT COUNT(ca) FROM CreditApplication ca WHERE ca.status = 'PENDING'")
    long countPendingApplications();
    
    // Find applications submitted between dates
    List<CreditApplication> findBySubmittedDateBetween(
            LocalDateTime startDate, 
            LocalDateTime endDate);
    
    // Find approved applications that don't have linked accounts yet
    @Query("SELECT ca FROM CreditApplication ca WHERE ca.status = 'APPROVED' AND ca.creditAccount IS NULL")
    List<CreditApplication> findApprovedApplicationsWithoutAccount();
}
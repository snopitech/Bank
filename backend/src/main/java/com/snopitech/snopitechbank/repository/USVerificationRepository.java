package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.USVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface USVerificationRepository extends JpaRepository<USVerification, Long> {
    
    // Find by email (to check duplicates)
    Optional<USVerification> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // Find by SSN last four (for searching)
    List<USVerification> findBySsnLastFour(String ssnLastFour);
    
    // Find by status
    List<USVerification> findByStatus(String status);
    
    // Find pending verifications ordered by submission date (oldest first)
    List<USVerification> findByStatusOrderBySubmittedAtAsc(String status);
    
    // Find by user ID (after approval)
    List<USVerification> findByUserId(Long userId);
    
    // Find by date range
    List<USVerification> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Search by name or email (for admin)
    @Query("SELECT v FROM USVerification v WHERE " +
           "LOWER(v.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY v.submittedAt DESC")
    List<USVerification> searchByUserInfo(@Param("searchTerm") String searchTerm);
    
    // Count by status
    @Query("SELECT COUNT(v) FROM USVerification v WHERE v.status = :status")
    long countByStatus(@Param("status") String status);
    
    // ⭐ HELPER METHODS (default methods)
    
    default List<USVerification> findAllPending() {
        return findByStatusOrderBySubmittedAtAsc("PENDING_REVIEW");
    }
    
    default List<USVerification> findAllApproved() {
        return findByStatusOrderBySubmittedAtAsc("APPROVED");
    }
    
    default List<USVerification> findAllRejected() {
        return findByStatusOrderBySubmittedAtAsc("REJECTED");
    }
    
    default boolean hasPendingVerification(String email) {
        return existsByEmailAndStatus(email, "PENDING_REVIEW");
    }
    
    // Need this for the helper above
    boolean existsByEmailAndStatus(String email, String status);

    
}
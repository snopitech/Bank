package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.PendingVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PendingVerificationRepository extends JpaRepository<PendingVerification, Long> {
    
    // Find all pending verifications for a specific user
    List<PendingVerification> findByUserId(Long userId);
    
    // Find all pending verifications by status
    List<PendingVerification> findByStatus(String status);
    
    // Find pending verifications for a specific user with a specific status
    List<PendingVerification> findByUserIdAndStatus(Long userId, String status);
    
    // Find by transaction ID (Trulioo reference)
    Optional<PendingVerification> findByTransactionId(String transactionId);
    
    // Check if user has any pending verification
    boolean existsByUserIdAndStatus(Long userId, String status);
    
    // Find all pending verifications ordered by submission date (oldest first)
    List<PendingVerification> findAllByOrderBySubmittedAtAsc();
    
    // Find pending verifications by status ordered by submission date
    List<PendingVerification> findByStatusOrderBySubmittedAtAsc(String status);
    
    // ⭐ HELPER METHODS
    
    default List<PendingVerification> findAllPending() {
        return findByStatus("PENDING_REVIEW");
    }
    
    default List<PendingVerification> findAllApproved() {
        return findByStatus("APPROVED");
    }
    
    default List<PendingVerification> findAllRejected() {
        return findByStatus("REJECTED");
    }
    
    default boolean hasPendingVerification(Long userId) {
        return existsByUserIdAndStatus(userId, "PENDING_REVIEW");
    }
    
    default Optional<PendingVerification> findLatestByUserId(Long userId) {
        List<PendingVerification> userVerifications = findByUserIdOrderBySubmittedAtDesc(userId);
        return userVerifications.isEmpty() ? Optional.empty() : Optional.of(userVerifications.get(0));
    }
    
    // Need this for the helper method above
    List<PendingVerification> findByUserIdOrderBySubmittedAtDesc(Long userId);
    @Transactional
@Modifying
@Query("DELETE FROM PendingVerification pv WHERE pv.submittedAt < :cutoffDate")
int deleteBySubmittedAtBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
    
}
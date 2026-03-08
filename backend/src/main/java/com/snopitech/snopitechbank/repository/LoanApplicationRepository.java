package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.LoanApplication;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@SuppressWarnings("unused")
@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    
    // ⭐ FIND BY USER
    List<LoanApplication> findByUser(User user);
    
    List<LoanApplication> findByUserId(Long userId);
    
    // ⭐ FIND BY STATUS
    List<LoanApplication> findByStatus(String status);
    
    List<LoanApplication> findByStatusOrderBySubmittedAtDesc(String status);
    
    // ⭐ FIND PENDING APPLICATIONS (for admin)
    @Query("SELECT l FROM LoanApplication l WHERE l.status = 'PENDING' ORDER BY l.submittedAt ASC")
    List<LoanApplication> findAllPending();
    
    // ⭐ FIND APPROVED APPLICATIONS
    @Query("SELECT l FROM LoanApplication l WHERE l.status = 'APPROVED' ORDER BY l.submittedAt DESC")
    List<LoanApplication> findAllApproved();
    
    // ⭐ FIND REJECTED APPLICATIONS
    @Query("SELECT l FROM LoanApplication l WHERE l.status = 'REJECTED' ORDER BY l.submittedAt DESC")
    List<LoanApplication> findAllRejected();
    
    // ⭐ COUNT USER'S APPLICATIONS BY STATUS
    Long countByUserIdAndStatus(Long userId, String status);
    
    // ⭐ COUNT USER'S APPROVED LOANS (for existing loan count)
    @Query("SELECT COUNT(l) FROM LoanApplication l WHERE l.user.id = :userId AND l.status = 'APPROVED'")
    int countApprovedLoansByUserId(@Param("userId") Long userId);
    
    // ⭐ FIND APPLICATIONS BY DATE RANGE
    List<LoanApplication> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // ⭐ SEARCH BY USER INFO (for admin)
    @Query("SELECT l FROM LoanApplication l WHERE " +
           "LOWER(l.user.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.user.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.user.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY l.submittedAt DESC")
    List<LoanApplication> searchByUserInfo(@Param("searchTerm") String searchTerm);
    
    // ⭐ FIND APPLICATIONS BY AMOUNT RANGE
    List<LoanApplication> findByRequestedAmountBetween(Double min, Double max);
    
    // ⭐ FIND APPLICATIONS BY PURPOSE
    List<LoanApplication> findByLoanPurpose(String purpose);
    
    // ⭐ CHECK IF USER HAS PENDING APPLICATION
    boolean existsByUserIdAndStatus(Long userId, String status);
    
    // ⭐ STATISTICS
    @Query("SELECT COUNT(l) FROM LoanApplication l")
    long getTotalApplications();
    
    @Query("SELECT COUNT(l) FROM LoanApplication l WHERE l.status = 'PENDING'")
    long getPendingCount();
    
    @Query("SELECT COUNT(l) FROM LoanApplication l WHERE l.status = 'APPROVED'")
    long getApprovedCount();
    
    @Query("SELECT COUNT(l) FROM LoanApplication l WHERE l.status = 'REJECTED'")
    long getRejectedCount();
    
    @Query("SELECT COALESCE(SUM(l.requestedAmount), 0) FROM LoanApplication l WHERE l.status = 'APPROVED'")
    Double getTotalApprovedAmount();
}
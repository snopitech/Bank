package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CheckDeposit;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheckDepositRepository extends JpaRepository<CheckDeposit, Long> {
    
    // Find all deposits for a user
    List<CheckDeposit> findByUserOrderBySubmittedAtDesc(User user);
    
    // Find deposits by status for admin (ascending - oldest first for pending)
    List<CheckDeposit> findByStatusOrderBySubmittedAtAsc(String status);
    
    // Find deposits by status (descending - newest first for approved/rejected)
    List<CheckDeposit> findByStatusOrderBySubmittedAtDesc(String status);
    
    // Find user's deposits by status
    List<CheckDeposit> findByUserAndStatusOrderBySubmittedAtDesc(User user, String status);
    
    // Count by status for stats
    long countByStatus(String status);
}
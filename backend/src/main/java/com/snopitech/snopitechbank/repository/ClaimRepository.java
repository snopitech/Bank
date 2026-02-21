package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Claim;  // This import should point to your Claim class
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    
    // Find all claims for a specific user
    List<Claim> findByUserId(Long userId);
    
    // Find claims by status
    List<Claim> findByStatus(String status);
    
    // Find claims by user and status
    List<Claim> findByUserIdAndStatus(Long userId, String status);
    
    // Find claim by claim number
    java.util.Optional<Claim> findByClaimNumber(String claimNumber);
    
    // Find active claims (not RESOLVED or CLOSED) for a user
    List<Claim> findByUserIdAndStatusNotIn(Long userId, List<String> statuses);
    
    // Count claims by user
    long countByUserId(Long userId);
}
package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.DirectDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DirectDepositRepository extends JpaRepository<DirectDeposit, Long> {
    
    // Find all direct deposits for a specific account
    List<DirectDeposit> findByAccountId(Long accountId);
    
    // Find active direct deposits for an account
    List<DirectDeposit> findByAccountIdAndActiveTrue(Long accountId);
    
    // Find primary direct deposit for an account
    Optional<DirectDeposit> findByAccountIdAndIsPrimaryDepositTrue(Long accountId);
    
    // Find by employer name (for searching)
    List<DirectDeposit> findByEmployerNameContainingIgnoreCase(String employerName);
    
    // Find by status
    List<DirectDeposit> findByStatus(String status);
    
    // Check if account has any direct deposit setup
    boolean existsByAccountId(Long accountId);
}

package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Overdraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface OverdraftRepository extends JpaRepository<Overdraft, Long> {

    // Find overdraft by account ID (matches your pattern from AccountRepository)
    Optional<Overdraft> findByAccountId(Long accountId);

    // Check if account has overdraft settings
    boolean existsByAccountId(Long accountId);

    // Delete overdraft when account is closed (optional)
    @Modifying
    @Transactional
    @Query("DELETE FROM Overdraft o WHERE o.accountId = :accountId")
    void deleteByAccountId(@Param("accountId") Long accountId);

    // Find accounts with active overdraft protection
    @Query("SELECT o FROM Overdraft o WHERE o.overdraftEnabled = true AND o.overdraftLimit > 0")
    java.util.List<Overdraft> findAllActiveOverdrafts();

    // Find accounts that are currently overdrawn (have negative balance)
    @Query("SELECT o FROM Overdraft o WHERE o.currentOverdraftBalance > 0")
    java.util.List<Overdraft> findAllOverdrawnAccounts();
}
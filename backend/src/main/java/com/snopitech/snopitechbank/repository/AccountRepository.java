package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Add this import

public interface AccountRepository extends JpaRepository<Account, Long> {

    Account findByAccountNumber(String accountNumber);
    
    // ADD THIS LINE:
    List<Account> findByUserId(Long userId);
}
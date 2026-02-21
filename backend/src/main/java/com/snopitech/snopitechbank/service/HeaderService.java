package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HeaderService {
    
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    
    public HeaderService(AccountRepository accountRepository,
                        TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }
    
    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 1. Get user's accounts
            List<Account> userAccounts = accountRepository.findByUserId(userId);
            
            // 2. Calculate total balance
            double totalBalance = 0.0;
            for (Account account : userAccounts) {
                totalBalance += account.getBalance();
            }
            
            // 3. Count today's transactions
            LocalDateTime startOfDay = LocalDateTime.now()
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime endOfDay = LocalDateTime.now()
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            
            int todaysTransactionCount = 0;
            for (Account account : userAccounts) {
                todaysTransactionCount += transactionRepository
                    .countByAccountIdAndTimestampBetween(
                        account.getId(), startOfDay, endOfDay
                    );
            }
            
            // 4. Build stats
            stats.put("success", true);
            stats.put("balance", totalBalance);
            stats.put("todaysTransactions", todaysTransactionCount);
            stats.put("totalAccounts", userAccounts.size());
            stats.put("accountStatus", "active");
            stats.put("securityLevel", "high");
            stats.put("lastUpdate", LocalDateTime.now().toString());
            
        } catch (Exception e) {
            // If there's any error, return safe mock data
            stats.put("success", false);
            stats.put("balance", 0.0);
            stats.put("todaysTransactions", 0);
            stats.put("totalAccounts", 0);
            stats.put("accountStatus", "active");
            stats.put("securityLevel", "normal");
            stats.put("lastUpdate", LocalDateTime.now().toString());
        }
        
        return stats;
    }
}
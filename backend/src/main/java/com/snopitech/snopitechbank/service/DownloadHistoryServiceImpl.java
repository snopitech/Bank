package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.DownloadHistory;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.repository.DownloadHistoryRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DownloadHistoryServiceImpl implements DownloadHistoryService {

    @Autowired
    private DownloadHistoryRepository downloadHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public List<DownloadHistory> getDownloadHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findByUserOrderByDownloadDateDesc(user);
    }

    @Override
    public List<DownloadHistory> getRecentDownloads(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findTop10ByUserOrderByDownloadDateDesc(user);
    }

    @Override
    public DownloadHistory saveDownloadRecord(Long userId, Long accountId, String fileName,
                                               String fileFormat, Integer transactionCount,
                                               LocalDateTime startDate, LocalDateTime endDate,
                                               String filterType, Long fileSize) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        DownloadHistory downloadHistory = new DownloadHistory(user, account, fileName, fileFormat);
        downloadHistory.setTransactionCount(transactionCount);
        downloadHistory.setDateRangeStart(startDate);
        downloadHistory.setDateRangeEnd(endDate);
        downloadHistory.setFilterType(filterType);
        downloadHistory.setFileSize(fileSize);
        downloadHistory.setIpAddress("127.0.0.1"); // In production, get from request
        downloadHistory.setStatus("SUCCESS");
        
        return downloadHistoryRepository.save(downloadHistory);
    }

    @Override
    public List<DownloadHistory> getDownloadHistoryByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findByUserAndDownloadDateBetweenOrderByDownloadDateDesc(user, start, end);
    }

    @Override
    public List<DownloadHistory> getDownloadHistoryByFormat(Long userId, String fileFormat) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findByUserAndFileFormatOrderByDownloadDateDesc(user, fileFormat);
    }

    @Override
    public void deleteOldRecords(LocalDateTime before) {
        // Since there's no direct delete method, we need to implement it
        List<DownloadHistory> oldRecords = downloadHistoryRepository.findAll().stream()
                .filter(dh -> dh.getDownloadDate().isBefore(before))
                .toList();
        
        downloadHistoryRepository.deleteAll(oldRecords);
    }

    // Additional useful methods
    public long countDownloadsSince(Long userId, LocalDateTime date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.countDownloadsSince(user, date);
    }

    public List<DownloadHistory> getFailedDownloads(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findByUserAndStatusOrderByDownloadDateDesc(user, "FAILED");
    }

    public List<Object[]> getDownloadStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.getDownloadStatistics(user);
    }
}
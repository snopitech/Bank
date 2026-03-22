package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.DownloadHistory;
import java.time.LocalDateTime;
import java.util.List;

public interface DownloadHistoryService {

    // Get all download history for a user
    List<DownloadHistory> getDownloadHistory(Long userId);

    // Get recent downloads for a user (last 10)
    List<DownloadHistory> getRecentDownloads(Long userId);

    // Save a new download record
    DownloadHistory saveDownloadRecord(Long userId, Long accountId, String fileName, 
                                        String fileFormat, Integer transactionCount,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        String filterType, Long fileSize);

    // Get download history by date range
    List<DownloadHistory> getDownloadHistoryByDateRange(Long userId, LocalDateTime start, LocalDateTime end);

    // Get download history by file format
    List<DownloadHistory> getDownloadHistoryByFormat(Long userId, String fileFormat);

    // Delete old download history (for cleanup)
    void deleteOldRecords(LocalDateTime before);
}
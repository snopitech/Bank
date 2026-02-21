package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.DownloadHistory;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface DownloadHistoryRepository extends JpaRepository<DownloadHistory, Long> {

    // Find download history for a specific user (ordered by most recent first)
    List<DownloadHistory> findByUserOrderByDownloadDateDesc(User user);

    // Find download history for a specific user with limit (for "recent downloads")
    List<DownloadHistory> findTop10ByUserOrderByDownloadDateDesc(User user);

    // Find download history for a specific account
    List<DownloadHistory> findByAccountIdOrderByDownloadDateDesc(Long accountId);

    List<DownloadHistory> findByAccountId(Long accountId);

    // Find downloads within a date range
    List<DownloadHistory> findByUserAndDownloadDateBetweenOrderByDownloadDateDesc(
        User user, LocalDateTime startDate, LocalDateTime endDate);

    // Find downloads by format
    List<DownloadHistory> findByUserAndFileFormatOrderByDownloadDateDesc(
        User user, String fileFormat);

    // Count downloads for a user in the last 30 days
    @Query("SELECT COUNT(d) FROM DownloadHistory d WHERE d.user = :user AND d.downloadDate >= :date")
    long countDownloadsSince(@Param("user") User user, @Param("date") LocalDateTime date);

    // Find failed downloads
    List<DownloadHistory> findByUserAndStatusOrderByDownloadDateDesc(
        User user, String status);

    // Get download statistics for a user
    @Query("SELECT d.fileFormat, COUNT(d), SUM(d.transactionCount) " +
           "FROM DownloadHistory d WHERE d.user = :user GROUP BY d.fileFormat")
    List<Object[]> getDownloadStatistics(@Param("user") User user);
}
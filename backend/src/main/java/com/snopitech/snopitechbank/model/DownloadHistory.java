package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "download_history")
public class DownloadHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_format", nullable = false)
    private String fileFormat; // CSV, PDF, QFX, OFX

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "date_range_start")
    private LocalDateTime dateRangeStart;

    @Column(name = "date_range_end")
    private LocalDateTime dateRangeEnd;

    @Column(name = "filter_type")
    private String filterType; // all, deposits, withdrawals, transfers

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Column(name = "download_date", nullable = false)
    private LocalDateTime downloadDate;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "status")
    private String status = "SUCCESS"; // SUCCESS, FAILED

    // Constructors
    public DownloadHistory() {
        this.downloadDate = LocalDateTime.now();
    }

    public DownloadHistory(User user, Account account, String fileName, String fileFormat) {
        this.user = user;
        this.account = account;
        this.fileName = fileName;
        this.fileFormat = fileFormat;
        this.downloadDate = LocalDateTime.now();
        this.status = "SUCCESS";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public Integer getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(Integer transactionCount) {
        this.transactionCount = transactionCount;
    }

    public LocalDateTime getDateRangeStart() {
        return dateRangeStart;
    }

    public void setDateRangeStart(LocalDateTime dateRangeStart) {
        this.dateRangeStart = dateRangeStart;
    }

    public LocalDateTime getDateRangeEnd() {
        return dateRangeEnd;
    }

    public void setDateRangeEnd(LocalDateTime dateRangeEnd) {
        this.dateRangeEnd = dateRangeEnd;
    }

    public String getFilterType() {
        return filterType;
    }

    public void setFilterType(String filterType) {
        this.filterType = filterType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getDownloadDate() {
        return downloadDate;
    }

    public void setDownloadDate(LocalDateTime downloadDate) {
        this.downloadDate = downloadDate;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Helper method to get formatted file size
    public String getFormattedFileSize() {
        if (fileSize == null) return "N/A";
        if (fileSize < 1024) return fileSize + " B";
        if (fileSize < 1024 * 1024) return String.format("%.1f KB", fileSize / 1024.0);
        return String.format("%.1f MB", fileSize / (1024.0 * 1024.0));
    }
}
package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ClaimDTO {
    
    private Long id;
    private Long userId;
    private Long accountId;
    private String claimNumber;
    private String claimType;
    private String status;
    private String priority;
    private String subject;
    private String description;
    private Double disputedAmount;
    private LocalDateTime transactionDate;
    private String transactionId;
    private String merchantName;
    private String resolution;
    private LocalDateTime filedDate;
    private LocalDateTime lastUpdatedDate;
    private LocalDateTime resolvedDate;
    private List<ClaimDocumentDTO> documents;
    private int documentCount;

    // Constructors
    public ClaimDTO() {}

    public ClaimDTO(Long id, Long userId, Long accountId, String claimNumber, 
                   String claimType, String status, String priority, String subject,
                   String description, Double disputedAmount, LocalDateTime transactionDate,
                   String transactionId, String merchantName, String resolution,
                   LocalDateTime filedDate, LocalDateTime lastUpdatedDate, 
                   LocalDateTime resolvedDate, List<ClaimDocumentDTO> documents) {
        this.id = id;
        this.userId = userId;
        this.accountId = accountId;
        this.claimNumber = claimNumber;
        this.claimType = claimType;
        this.status = status;
        this.priority = priority;
        this.subject = subject;
        this.description = description;
        this.disputedAmount = disputedAmount;
        this.transactionDate = transactionDate;
        this.transactionId = transactionId;
        this.merchantName = merchantName;
        this.resolution = resolution;
        this.filedDate = filedDate;
        this.lastUpdatedDate = lastUpdatedDate;
        this.resolvedDate = resolvedDate;
        this.documents = documents;
        this.documentCount = documents != null ? documents.size() : 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getClaimType() {
        return claimType;
    }

    public void setClaimType(String claimType) {
        this.claimType = claimType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getDisputedAmount() {
        return disputedAmount;
    }

    public void setDisputedAmount(Double disputedAmount) {
        this.disputedAmount = disputedAmount;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public LocalDateTime getFiledDate() {
        return filedDate;
    }

    public void setFiledDate(LocalDateTime filedDate) {
        this.filedDate = filedDate;
    }

    public LocalDateTime getLastUpdatedDate() {
        return lastUpdatedDate;
    }

    public void setLastUpdatedDate(LocalDateTime lastUpdatedDate) {
        this.lastUpdatedDate = lastUpdatedDate;
    }

    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public List<ClaimDocumentDTO> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ClaimDocumentDTO> documents) {
        this.documents = documents;
        this.documentCount = documents != null ? documents.size() : 0;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }
}

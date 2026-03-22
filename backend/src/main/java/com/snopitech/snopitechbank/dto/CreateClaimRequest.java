package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class CreateClaimRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long accountId;

    @NotBlank(message = "Claim type is required")
    @Size(max = 50, message = "Claim type must be less than 50 characters")
    private String claimType; // FRAUD, UNAUTHORIZED_TRANSACTION, DUPLICATE_CHARGE, SERVICE_ISSUE, OTHER

    @NotBlank(message = "Priority is required")
    @Size(max = 20, message = "Priority must be less than 20 characters")
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must be less than 200 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    @Positive(message = "Disputed amount must be positive")
    private Double disputedAmount;

    private LocalDateTime transactionDate;

    private String transactionId;

    @Size(max = 100, message = "Merchant name must be less than 100 characters")
    private String merchantName;

    // Getters and Setters
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

    public String getClaimType() {
        return claimType;
    }

    public void setClaimType(String claimType) {
        this.claimType = claimType;
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
}
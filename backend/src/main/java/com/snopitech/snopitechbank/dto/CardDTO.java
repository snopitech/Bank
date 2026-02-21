package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CardDTO {
    
    private Long id;
    private Long accountId;
    private String cardNumber;
    private String maskedCardNumber;
    private String cardHolderName;
    private String cardType;
    private LocalDate expiryDate;
    private String status;
    private Boolean isVirtual;
    private String designColor;
    private String designImage;
    private LocalDateTime issuedDate;
    private LocalDateTime lastUsedDate;
    private Double dailyLimit;
    private Double transactionLimit;
    private Double monthlyLimit;
    private Boolean isLocked;
    private Integer failedPinAttempts;
    private boolean isActive;
    private boolean isExpired;

    // Constructors
    public CardDTO() {}

    public CardDTO(Long id, Long accountId, String cardNumber, String cardHolderName, 
                   String cardType, LocalDate expiryDate, String status, Boolean isVirtual,
                   String designColor, String designImage, LocalDateTime issuedDate,
                   LocalDateTime lastUsedDate, Double dailyLimit, Double transactionLimit,
                   Double monthlyLimit, Boolean isLocked, Integer failedPinAttempts,
                   boolean isActive, boolean isExpired) {
        this.id = id;
        this.accountId = accountId;
        this.cardNumber = cardNumber;
        this.maskedCardNumber = maskCardNumber(cardNumber);
        this.cardHolderName = cardHolderName;
        this.cardType = cardType;
        this.expiryDate = expiryDate;
        this.status = status;
        this.isVirtual = isVirtual;
        this.designColor = designColor;
        this.designImage = designImage;
        this.issuedDate = issuedDate;
        this.lastUsedDate = lastUsedDate;
        this.dailyLimit = dailyLimit;
        this.transactionLimit = transactionLimit;
        this.monthlyLimit = monthlyLimit;
        this.isLocked = isLocked;
        this.failedPinAttempts = failedPinAttempts;
        this.isActive = isActive;
        this.isExpired = isExpired;
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****-****-****-" + cardNumber.substring(cardNumber.length() - 4);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
        this.maskedCardNumber = maskCardNumber(cardNumber);
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsVirtual() {
        return isVirtual;
    }

    public void setIsVirtual(Boolean isVirtual) {
        this.isVirtual = isVirtual;
    }

    public String getDesignColor() {
        return designColor;
    }

    public void setDesignColor(String designColor) {
        this.designColor = designColor;
    }

    public String getDesignImage() {
        return designImage;
    }

    public void setDesignImage(String designImage) {
        this.designImage = designImage;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }

    public LocalDateTime getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(LocalDateTime lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public Double getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(Double dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public Double getTransactionLimit() {
        return transactionLimit;
    }

    public void setTransactionLimit(Double transactionLimit) {
        this.transactionLimit = transactionLimit;
    }

    public Double getMonthlyLimit() {
        return monthlyLimit;
    }

    public void setMonthlyLimit(Double monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public Integer getFailedPinAttempts() {
        return failedPinAttempts;
    }

    public void setFailedPinAttempts(Integer failedPinAttempts) {
        this.failedPinAttempts = failedPinAttempts;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public void setExpired(boolean expired) {
        isExpired = expired;
    }
}
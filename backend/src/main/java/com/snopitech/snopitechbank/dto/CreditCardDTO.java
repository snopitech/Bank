package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CreditCardDTO {

    private Long id;
    private Long creditAccountId;
    private String cardNumber;
    private String maskedCardNumber;
    private String cardHolderName;
    private String cardType;
    private LocalDate expiryDate;
    private String status;
    private Boolean isVirtual;
    private String designColor;
    private LocalDateTime issuedDate;
    private LocalDateTime lastUsedDate;
    
    // Credit limits
    private Double creditLimit;
    private Double availableCredit;
    private Double currentBalance;
    
    // Features
    private Double foreignTransactionFee;
    private Double cashAdvanceLimit;
    private Double cashAdvanceAvailable;
    private Double cashAdvanceFee;
    
    // Rewards
    private Integer rewardPoints;
    private String rewardType;
    
    // Security
    private Boolean isLocked;
    private Integer failedPinAttempts;
    private LocalDateTime lockedUntil;
    
    // Helper booleans
    private boolean isActive;
    private boolean isExpired;

    // Constructors
    public CreditCardDTO() {}

    public CreditCardDTO(Long id, Long creditAccountId, String cardNumber, String cardHolderName,
                         String cardType, LocalDate expiryDate, String status, Boolean isVirtual,
                         String designColor, LocalDateTime issuedDate, LocalDateTime lastUsedDate,
                         Double creditLimit, Double availableCredit, Double currentBalance,
                         Double foreignTransactionFee, Double cashAdvanceLimit,
                         Double cashAdvanceAvailable, Double cashAdvanceFee,
                         Integer rewardPoints, String rewardType, Boolean isLocked,
                         Integer failedPinAttempts, LocalDateTime lockedUntil) {
        this.id = id;
        this.creditAccountId = creditAccountId;
        this.cardNumber = cardNumber;
        this.maskedCardNumber = maskCardNumber(cardNumber);
        this.cardHolderName = cardHolderName;
        this.cardType = cardType;
        this.expiryDate = expiryDate;
        this.status = status;
        this.isVirtual = isVirtual;
        this.designColor = designColor;
        this.issuedDate = issuedDate;
        this.lastUsedDate = lastUsedDate;
        this.creditLimit = creditLimit;
        this.availableCredit = availableCredit;
        this.currentBalance = currentBalance;
        this.foreignTransactionFee = foreignTransactionFee;
        this.cashAdvanceLimit = cashAdvanceLimit;
        this.cashAdvanceAvailable = cashAdvanceAvailable;
        this.cashAdvanceFee = cashAdvanceFee;
        this.rewardPoints = rewardPoints;
        this.rewardType = rewardType;
        this.isLocked = isLocked;
        this.failedPinAttempts = failedPinAttempts;
        this.lockedUntil = lockedUntil;
        
        this.isActive = "ACTIVE".equals(status) && !isExpired() && !isLocked;
        this.isExpired = isExpired();
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****-****-****-" + cardNumber.substring(cardNumber.length() - 4);
    }

   @SuppressWarnings("unused")
private boolean checkIfExpired() {
    return expiryDate != null && LocalDate.now().isAfter(expiryDate);
}

// Helper methods
public boolean isActive() {
    return isActive;
}

public boolean isExpired() {
    return isExpired;
}

public boolean canMakePurchase(Double amount) {
    return availableCredit != null && availableCredit >= amount && isActive;
}
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCreditAccountId() {
        return creditAccountId;
    }

    public void setCreditAccountId(Long creditAccountId) {
        this.creditAccountId = creditAccountId;
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
        this.isExpired = isExpired();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.isActive = "ACTIVE".equals(status) && !isExpired() && !isLocked;
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

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public Double getAvailableCredit() {
        return availableCredit;
    }

    public void setAvailableCredit(Double availableCredit) {
        this.availableCredit = availableCredit;
    }

    public Double getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Double currentBalance) {
        this.currentBalance = currentBalance;
    }

    public Double getForeignTransactionFee() {
        return foreignTransactionFee;
    }

    public void setForeignTransactionFee(Double foreignTransactionFee) {
        this.foreignTransactionFee = foreignTransactionFee;
    }

    public Double getCashAdvanceLimit() {
        return cashAdvanceLimit;
    }

    public void setCashAdvanceLimit(Double cashAdvanceLimit) {
        this.cashAdvanceLimit = cashAdvanceLimit;
    }

    public Double getCashAdvanceAvailable() {
        return cashAdvanceAvailable;
    }

    public void setCashAdvanceAvailable(Double cashAdvanceAvailable) {
        this.cashAdvanceAvailable = cashAdvanceAvailable;
    }

    public Double getCashAdvanceFee() {
        return cashAdvanceFee;
    }

    public void setCashAdvanceFee(Double cashAdvanceFee) {
        this.cashAdvanceFee = cashAdvanceFee;
    }

    public Integer getRewardPoints() {
        return rewardPoints;
    }

    public void setRewardPoints(Integer rewardPoints) {
        this.rewardPoints = rewardPoints;
    }

    public String getRewardType() {
        return rewardType;
    }

    public void setRewardType(String rewardType) {
        this.rewardType = rewardType;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
        this.isActive = "ACTIVE".equals(status) && !isExpired() && !isLocked;
    }

    public Integer getFailedPinAttempts() {
        return failedPinAttempts;
    }

    public void setFailedPinAttempts(Integer failedPinAttempts) {
        this.failedPinAttempts = failedPinAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }
}
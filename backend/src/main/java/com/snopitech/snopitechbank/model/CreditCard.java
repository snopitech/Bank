package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "credit_cards")
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "credit_account_id", nullable = false)
    @JsonIgnore
    private CreditAccount creditAccount; // The credit account this card belongs to

    @Column(nullable = false, unique = true)
    private String cardNumber; // 16-digit card number

    @Column(nullable = false)
    private String cardHolderName;

    @Column(nullable = false)
    private String cardType; // PHYSICAL, VIRTUAL

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private String cvv; // Hashed

    @Column(nullable = false)
    private String pinHash; // BCrypted PIN

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, FROZEN, EXPIRED, REPLACED, CANCELLED

    @Column(nullable = false)
    private Boolean isVirtual = false;

    private String designColor;
    private String designImage;

    @Column(nullable = false)
    private LocalDateTime issuedDate;

    private LocalDateTime lastUsedDate;
    private LocalDateTime frozenDate;
    private LocalDateTime replacedDate;

    // Credit card specific fields
    @Column(nullable = false)
    private Double creditLimit; // Individual card limit (usually same as account)

    @Column(nullable = false)
    private Double availableCredit;

    @Column(nullable = false)
    private Double currentBalance;

    // Foreign transaction fee (e.g., 3%)
    private Double foreignTransactionFee;

    // Cash advance settings
    private Double cashAdvanceLimit;
    private Double cashAdvanceAvailable;
    private Double cashAdvanceFee; // e.g., 5% or $10 min

    // Reward points (if applicable)
    private Integer rewardPoints;
    private String rewardType; // CASH_BACK, POINTS, MILES

    // Tracking
    private Integer failedPinAttempts = 0;
    private Boolean isLocked = false;
    private LocalDateTime lockedUntil;

    // For replacement tracking
    private Long replacedByCardId;
    private String replacementReason; // LOST, STOLEN, DAMAGED

    // Constructors
    public CreditCard() {
        this.issuedDate = LocalDateTime.now();
        this.status = "INACTIVE";
    }

    public CreditCard(CreditAccount creditAccount, String cardHolderName, String cardType) {
        this.creditAccount = creditAccount;
        this.cardHolderName = cardHolderName;
        this.cardType = cardType;
        this.creditLimit = creditAccount.getCreditLimit();
        this.availableCredit = creditAccount.getAvailableCredit();
        this.currentBalance = creditAccount.getCurrentBalance();
        this.issuedDate = LocalDateTime.now();
        this.status = "INACTIVE";
        this.isVirtual = "VIRTUAL".equals(cardType);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CreditAccount getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(CreditAccount creditAccount) {
        this.creditAccount = creditAccount;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
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

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
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

    public LocalDateTime getFrozenDate() {
        return frozenDate;
    }

    public void setFrozenDate(LocalDateTime frozenDate) {
        this.frozenDate = frozenDate;
    }

    public LocalDateTime getReplacedDate() {
        return replacedDate;
    }

    public void setReplacedDate(LocalDateTime replacedDate) {
        this.replacedDate = replacedDate;
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

    public Integer getFailedPinAttempts() {
        return failedPinAttempts;
    }

    public void setFailedPinAttempts(Integer failedPinAttempts) {
        this.failedPinAttempts = failedPinAttempts;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public Long getReplacedByCardId() {
        return replacedByCardId;
    }

    public void setReplacedByCardId(Long replacedByCardId) {
        this.replacedByCardId = replacedByCardId;
    }

    public String getReplacementReason() {
        return replacementReason;
    }

    public void setReplacementReason(String replacementReason) {
        this.replacementReason = replacementReason;
    }

    // Helper methods
    public String getMaskedCardNumber() {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****-****-****-" + cardNumber.substring(cardNumber.length() - 4);
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(expiryDate);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status) && !isExpired() && !isLocked;
    }

    public void incrementFailedPinAttempts() {
        this.failedPinAttempts++;
        if (this.failedPinAttempts >= 3) {
            this.isLocked = true;
            this.lockedUntil = LocalDateTime.now().plusHours(24);
            this.status = "FROZEN";
            this.frozenDate = LocalDateTime.now();
        }
    }

    public void resetFailedPinAttempts() {
        this.failedPinAttempts = 0;
        this.isLocked = false;
        this.lockedUntil = null;
    }

    public boolean canMakePurchase(Double amount) {
        return availableCredit >= amount;
    }

    public void makePurchase(Double amount) {
        if (canMakePurchase(amount)) {
            this.currentBalance += amount;
            this.availableCredit -= amount;
            this.lastUsedDate = LocalDateTime.now();
        } else {
            throw new RuntimeException("Insufficient credit available");
        }
    }

    public void makePayment(Double amount) {
        this.currentBalance -= amount;
        this.availableCredit += amount;
    }
}
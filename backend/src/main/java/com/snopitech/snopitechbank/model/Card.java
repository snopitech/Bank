package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
     
    // Add this after the account field
@ManyToOne
@JoinColumn(name = "business_account_id")
private BusinessAccount businessAccount; // Optional - null for personal cards

// Also add a field to track card purpose/type
@Column(name = "card_purpose")
private String cardPurpose; // PRIMARY, SECONDARY, VIRTUAL, CREDIT

    @Column(nullable = false, unique = true)
    private String cardNumber; // Encrypted in database

    @Column(nullable = false)
    private String cardHolderName;

    @Column(nullable = false)
    private String cardType; // PHYSICAL, VIRTUAL

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private String cvv; // Hashed, not stored in plaintext

    @Column(nullable = false)
    private String pinHash; // BCrypted PIN

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, FROZEN, EXPIRED, REPLACED, STOLEN

    @Column(nullable = false)
    private Boolean isVirtual = false;

    private String designColor; // For custom card design
    private String designImage; // URL or reference to custom image

    @Column(nullable = false)
    private LocalDateTime issuedDate;

    private LocalDateTime lastUsedDate;
    private LocalDateTime frozenDate;
    private LocalDateTime replacedDate;

    // Spending limits
    private Double dailyLimit;
    private Double transactionLimit;
    private Double monthlyLimit;

    // Tracking
    private Integer failedPinAttempts = 0;
    private Boolean isLocked = false;
    private LocalDateTime lockedUntil;

    // For replacement tracking
    private Long replacedByCardId; // If this card was replaced, ID of new card
    private String replacementReason; // LOST, STOLEN, DAMAGED

    // Constructors
    public Card() {
        this.issuedDate = LocalDateTime.now();
        this.status = "INACTIVE"; // Needs activation
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
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
    public BusinessAccount getBusinessAccount() {
    return businessAccount;
}

public void setBusinessAccount(BusinessAccount businessAccount) {
    this.businessAccount = businessAccount;
}

public String getCardPurpose() {
    return cardPurpose;
}

public void setCardPurpose(String cardPurpose) {
    this.cardPurpose = cardPurpose;
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
}
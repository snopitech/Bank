package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class WalletCardDTO {

    private Long id;
    private Long walletId;
    private Long cardId;
    private String maskedCardNumber;
    private String cardType;
    private String cardHolderName;
    private String tokenizedCardNumber;
    private LocalDateTime addedDate;
    private LocalDateTime lastUsedDate;
    private String status;

    // Constructors
    public WalletCardDTO() {}

    public WalletCardDTO(Long id, Long walletId, Long cardId, String maskedCardNumber,
                         String cardType, String cardHolderName, String tokenizedCardNumber,
                         LocalDateTime addedDate, LocalDateTime lastUsedDate, String status) {
        this.id = id;
        this.walletId = walletId;
        this.cardId = cardId;
        this.maskedCardNumber = maskedCardNumber;
        this.cardType = cardType;
        this.cardHolderName = cardHolderName;
        this.tokenizedCardNumber = tokenizedCardNumber;
        this.addedDate = addedDate;
        this.lastUsedDate = lastUsedDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getTokenizedCardNumber() {
        return tokenizedCardNumber;
    }

    public void setTokenizedCardNumber(String tokenizedCardNumber) {
        this.tokenizedCardNumber = tokenizedCardNumber;
    }

    public LocalDateTime getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }

    public LocalDateTime getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(LocalDateTime lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Helper method to get last 4 digits for display
    public String getLastFour() {
        if (maskedCardNumber != null && maskedCardNumber.length() >= 4) {
            return maskedCardNumber.substring(maskedCardNumber.length() - 4);
        }
        return "****";
    }
}
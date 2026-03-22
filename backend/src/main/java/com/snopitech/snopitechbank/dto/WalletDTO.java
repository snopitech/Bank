package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;
import java.util.List;

public class WalletDTO {

    private Long id;
    private Long userId;
    private String walletType;
    private String walletDisplayName;
    private String walletIcon;
    private String deviceName;
    private String status;
    private LocalDateTime addedDate;
    private LocalDateTime lastUsedDate;
    private Boolean isPrimary;
    private Boolean biometricEnabled;
    private int cardCount;
    private List<WalletCardDTO> cards;

    // Constructors
    public WalletDTO() {}

    public WalletDTO(Long id, Long userId, String walletType, String deviceName, 
                     String status, LocalDateTime addedDate, LocalDateTime lastUsedDate,
                     Boolean isPrimary, Boolean biometricEnabled, int cardCount,
                     List<WalletCardDTO> cards) {
        this.id = id;
        this.userId = userId;
        this.walletType = walletType;
        this.walletDisplayName = getDisplayNameForType(walletType);
        this.walletIcon = getIconForType(walletType);
        this.deviceName = deviceName;
        this.status = status;
        this.addedDate = addedDate;
        this.lastUsedDate = lastUsedDate;
        this.isPrimary = isPrimary;
        this.biometricEnabled = biometricEnabled;
        this.cardCount = cardCount;
        this.cards = cards;
    }

    private String getDisplayNameForType(String type) {
        if (type == null) return "Digital Wallet";
        switch (type) {
            case "APPLE_PAY": return "Apple Pay";
            case "GOOGLE_PAY": return "Google Pay";
            case "SAMSUNG_PAY": return "Samsung Pay";
            case "PAYPAL": return "PayPal";
            case "VENMO": return "Venmo";
            default: return type;
        }
    }

    private String getIconForType(String type) {
        if (type == null) return "💼";
        switch (type) {
            case "APPLE_PAY": return "🍎";
            case "GOOGLE_PAY": return "📱";
            case "SAMSUNG_PAY": return "📲";
            case "PAYPAL": return "💸";
            case "VENMO": return "💳";
            default: return "💼";
        }
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

    public String getWalletType() {
        return walletType;
    }

    public void setWalletType(String walletType) {
        this.walletType = walletType;
        this.walletDisplayName = getDisplayNameForType(walletType);
        this.walletIcon = getIconForType(walletType);
    }

    public String getWalletDisplayName() {
        return walletDisplayName;
    }

    public String getWalletIcon() {
        return walletIcon;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    public Boolean getBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(Boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }

    public int getCardCount() {
        return cardCount;
    }

    public void setCardCount(int cardCount) {
        this.cardCount = cardCount;
    }

    public List<WalletCardDTO> getCards() {
        return cards;
    }

    public void setCards(List<WalletCardDTO> cards) {
        this.cards = cards;
        if (cards != null) {
            this.cardCount = cards.size();
        }
    }
}

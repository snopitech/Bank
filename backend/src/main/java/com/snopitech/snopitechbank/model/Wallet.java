package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String walletType; // APPLE_PAY, GOOGLE_PAY, SAMSUNG_PAY, PAYPAL, VENMO

    @Column(nullable = false)
    private String deviceName; // e.g., "iPhone 14 Pro", "Samsung S23"

    private String deviceId; // Unique device identifier (tokenized)

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, SUSPENDED

    @Column(nullable = false)
    private LocalDateTime addedDate;

    private LocalDateTime lastUsedDate;

    @Column(nullable = false)
    private Boolean isPrimary = false;

    // For push notifications
    private String pushToken;

    // Device information
    private String operatingSystem;
    private String operatingSystemVersion;
    private String appVersion;

    // Security
    private Boolean biometricEnabled = false;
    private LocalDateTime lastVerifiedDate;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WalletCard> walletCards = new ArrayList<>();

    // Constructors
    public Wallet() {
        this.addedDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public Wallet(User user, String walletType, String deviceName) {
        this.user = user;
        this.walletType = walletType;
        this.deviceName = deviceName;
        this.addedDate = LocalDateTime.now();
        this.status = "ACTIVE";
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

    public String getWalletType() {
        return walletType;
    }

    public void setWalletType(String walletType) {
        this.walletType = walletType;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
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

    public String getPushToken() {
        return pushToken;
    }

    public void setPushToken(String pushToken) {
        this.pushToken = pushToken;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getOperatingSystemVersion() {
        return operatingSystemVersion;
    }

    public void setOperatingSystemVersion(String operatingSystemVersion) {
        this.operatingSystemVersion = operatingSystemVersion;
    }

    public String getAppVersion() {
        return appVersion;
    }

    public void setAppVersion(String appVersion) {
        this.appVersion = appVersion;
    }

    public Boolean getBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(Boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }

    public LocalDateTime getLastVerifiedDate() {
        return lastVerifiedDate;
    }

    public void setLastVerifiedDate(LocalDateTime lastVerifiedDate) {
        this.lastVerifiedDate = lastVerifiedDate;
    }

    public List<WalletCard> getWalletCards() {
        return walletCards;
    }

    public void setWalletCards(List<WalletCard> walletCards) {
        this.walletCards = walletCards;
    }

    // Helper methods
    public String getWalletDisplayName() {
        switch (walletType) {
            case "APPLE_PAY": return "Apple Pay";
            case "GOOGLE_PAY": return "Google Pay";
            case "SAMSUNG_PAY": return "Samsung Pay";
            case "PAYPAL": return "PayPal";
            case "VENMO": return "Venmo";
            default: return walletType;
        }
    }

    public String getWalletIcon() {
        switch (walletType) {
            case "APPLE_PAY": return "🍎";
            case "GOOGLE_PAY": return "📱";
            case "SAMSUNG_PAY": return "📲";
            case "PAYPAL": return "💸";
            case "VENMO": return "💳";
            default: return "💼";
        }
    }

    public int getCardCount() {
        if (this.walletCards == null) {
            return 0;
        }
        return this.walletCards.size();
    }
}
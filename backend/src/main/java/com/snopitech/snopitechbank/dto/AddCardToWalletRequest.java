package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddCardToWalletRequest {

    @NotNull(message = "Card ID is required")
    private Long cardId;

    @NotBlank(message = "Device name is required")
    private String deviceName;

    private String deviceId;

    private String operatingSystem;
    private String operatingSystemVersion;
    private String appVersion;

    private Boolean setAsPrimary = false;
    private Boolean enableBiometrics = false;

    // For wallet provider integration
    private String walletProviderToken;
    private String walletCardId;

    // Getters and Setters
    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
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

    public Boolean getSetAsPrimary() {
        return setAsPrimary;
    }

    public void setSetAsPrimary(Boolean setAsPrimary) {
        this.setAsPrimary = setAsPrimary;
    }

    public Boolean getEnableBiometrics() {
        return enableBiometrics;
    }

    public void setEnableBiometrics(Boolean enableBiometrics) {
        this.enableBiometrics = enableBiometrics;
    }

    public String getWalletProviderToken() {
        return walletProviderToken;
    }

    public void setWalletProviderToken(String walletProviderToken) {
        this.walletProviderToken = walletProviderToken;
    }

    public String getWalletCardId() {
        return walletCardId;
    }

    public void setWalletCardId(String walletCardId) {
        this.walletCardId = walletCardId;
    }
}
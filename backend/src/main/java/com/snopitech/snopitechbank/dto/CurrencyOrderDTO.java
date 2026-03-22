package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class CurrencyOrderDTO {

    private Long id;
    private Long userId;
    private Long accountId;
    private String orderNumber;
    private String fromCurrency;
    private String toCurrency;
    private Double fromAmount;
    private Double toAmount;
    private Double exchangeRate;
    private String deliveryMethod;
    private String deliveryAddress;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private String status;
    private String trackingNumber;
    private Double fee;
    private String notes;
    private String accountNumber; // For display
    private String userFullName; // For display

    // Constructors
    public CurrencyOrderDTO() {}

    public CurrencyOrderDTO(Long id, Long userId, Long accountId, String orderNumber,
                           String fromCurrency, String toCurrency, Double fromAmount,
                           Double toAmount, Double exchangeRate, String deliveryMethod,
                           String deliveryAddress, LocalDateTime orderDate, LocalDateTime deliveryDate,
                           String status, String trackingNumber, Double fee, String notes,
                           String accountNumber, String userFullName) {
        this.id = id;
        this.userId = userId;
        this.accountId = accountId;
        this.orderNumber = orderNumber;
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.fromAmount = fromAmount;
        this.toAmount = toAmount;
        this.exchangeRate = exchangeRate;
        this.deliveryMethod = deliveryMethod;
        this.deliveryAddress = deliveryAddress;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.status = status;
        this.trackingNumber = trackingNumber;
        this.fee = fee;
        this.notes = notes;
        this.accountNumber = accountNumber;
        this.userFullName = userFullName;
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

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getFromCurrency() {
        return fromCurrency;
    }

    public void setFromCurrency(String fromCurrency) {
        this.fromCurrency = fromCurrency;
    }

    public String getToCurrency() {
        return toCurrency;
    }

    public void setToCurrency(String toCurrency) {
        this.toCurrency = toCurrency;
    }

    public Double getFromAmount() {
        return fromAmount;
    }

    public void setFromAmount(Double fromAmount) {
        this.fromAmount = fromAmount;
    }

    public Double getToAmount() {
        return toAmount;
    }

    public void setToAmount(Double toAmount) {
        this.toAmount = toAmount;
    }

    public Double getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(Double exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    // Helper methods
    public String getFormattedFromAmount() {
        return String.format("%.2f %s", fromAmount, fromCurrency);
    }

    public String getFormattedToAmount() {
        return String.format("%.2f %s", toAmount, toCurrency);
    }

    public String getFormattedExchangeRate() {
        return String.format("1 %s = %.4f %s", fromCurrency, exchangeRate, toCurrency);
    }

    public String getStatusColor() {
        switch (status) {
            case "PENDING": return "yellow";
            case "PROCESSING": return "blue";
            case "COMPLETED": return "green";
            case "CANCELLED": return "red";
            default: return "gray";
        }
    }

    public String getStatusBadge() {
        return status;
    }
}
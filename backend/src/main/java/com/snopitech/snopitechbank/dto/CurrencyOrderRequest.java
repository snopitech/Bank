package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CurrencyOrderRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotBlank(message = "From currency is required")
    private String fromCurrency; // Should be USD

    @NotBlank(message = "To currency is required")
    private String toCurrency; // EUR, GBP, JPY, etc.

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount; // Amount in USD

    @NotBlank(message = "Delivery method is required")
    private String deliveryMethod; // HOME_DELIVERY, BRANCH_PICKUP

    private String deliveryAddress; // Required if HOME_DELIVERY

    private String notes;

    // Getters and Setters
    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Validation helper
    public boolean isValid() {
        if (!"HOME_DELIVERY".equals(deliveryMethod) && !"BRANCH_PICKUP".equals(deliveryMethod)) {
            return false;
        }
        
        if ("HOME_DELIVERY".equals(deliveryMethod) && (deliveryAddress == null || deliveryAddress.trim().isEmpty())) {
            return false;
        }
        
        if (!"USD".equals(fromCurrency)) {
            return false;
        }
        
        return true;
    }
}

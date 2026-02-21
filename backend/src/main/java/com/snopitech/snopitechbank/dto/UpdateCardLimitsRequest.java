package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.Positive;

public class UpdateCardLimitsRequest {

    @Positive(message = "Daily limit must be positive")
    private Double dailyLimit;

    @Positive(message = "Transaction limit must be positive")
    private Double transactionLimit;

    @Positive(message = "Monthly limit must be positive")
    private Double monthlyLimit;

    // Getters and Setters
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
}
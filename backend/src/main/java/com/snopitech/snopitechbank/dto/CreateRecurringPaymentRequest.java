package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class CreateRecurringPaymentRequest {

    @NotBlank(message = "Payee name is required")
    private String payeeName;

    @NotBlank(message = "Payee account number is required")
    private String payeeAccountNumber;

    @Pattern(regexp = "^[0-9]{9}$", message = "Routing number must be 9 digits")
    private String payeeRoutingNumber;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotBlank(message = "Frequency is required")
    @Pattern(regexp = "WEEKLY|BIWEEKLY|MONTHLY|QUARTERLY|YEARLY", 
             message = "Frequency must be WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, or YEARLY")
    private String frequency;

    @NotNull(message = "Payment day is required")
    @Min(value = 0, message = "Payment day must be between 0-31 (0-6 for weekly, 1-31 for monthly)")
    @Max(value = 31, message = "Payment day must be between 0-31")
    private Integer paymentDay;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Pattern(regexp = "UTILITIES|RENT|SUBSCRIPTION|LOAN|INSURANCE|OTHER", 
             message = "Category must be UTILITIES, RENT, SUBSCRIPTION, LOAN, INSURANCE, or OTHER")
    private String category = "OTHER";

    private String description;

    // Getters and Setters
    public String getPayeeName() {
        return payeeName;
    }

    public void setPayeeName(String payeeName) {
        this.payeeName = payeeName;
    }

    public String getPayeeAccountNumber() {
        return payeeAccountNumber;
    }

    public void setPayeeAccountNumber(String payeeAccountNumber) {
        this.payeeAccountNumber = payeeAccountNumber;
    }

    public String getPayeeRoutingNumber() {
        return payeeRoutingNumber;
    }

    public void setPayeeRoutingNumber(String payeeRoutingNumber) {
        this.payeeRoutingNumber = payeeRoutingNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getPaymentDay() {
        return paymentDay;
    }

    public void setPaymentDay(Integer paymentDay) {
        this.paymentDay = paymentDay;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class UpdateRecurringPaymentRequest {

    private String payeeName;

    private String payeeAccountNumber;

    @Pattern(regexp = "^[0-9]{9}$", message = "Routing number must be 9 digits")
    private String payeeRoutingNumber;

    @Positive(message = "Amount must be positive")
    private Double amount;

    @Pattern(regexp = "WEEKLY|BIWEEKLY|MONTHLY|QUARTERLY|YEARLY", 
             message = "Frequency must be WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, or YEARLY")
    private String frequency;

    @Min(value = 0, message = "Payment day must be between 0-31")
    @Max(value = 31, message = "Payment day must be between 0-31")
    private Integer paymentDay;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Pattern(regexp = "ACTIVE|PAUSED|CANCELLED|COMPLETED", 
             message = "Status must be ACTIVE, PAUSED, CANCELLED, or COMPLETED")
    private String status;

    @Pattern(regexp = "UTILITIES|RENT|SUBSCRIPTION|LOAN|INSURANCE|OTHER", 
             message = "Category must be UTILITIES, RENT, SUBSCRIPTION, LOAN, INSURANCE, or OTHER")
    private String category;

    private String description;

    private Boolean active;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}

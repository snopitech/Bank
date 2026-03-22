package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class RecurringPaymentDTO {
    
    private Long id;
    private Long accountId;
    private String payeeName;
    private String payeeAccountNumber;
    private String payeeRoutingNumber;
    private Double amount;
    private String frequency;
    private Integer paymentDay;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime nextPaymentDate;
    private LocalDateTime lastPaymentDate;
    private Boolean active;
    private String status;
    private String category;
    private String description;
    private LocalDateTime createdAt;

    // Constructors
    public RecurringPaymentDTO() {}

    public RecurringPaymentDTO(Long id, Long accountId, String payeeName, 
                              String payeeAccountNumber, String payeeRoutingNumber,
                              Double amount, String frequency, Integer paymentDay,
                              LocalDateTime startDate, LocalDateTime endDate,
                              LocalDateTime nextPaymentDate, LocalDateTime lastPaymentDate,
                              Boolean active, String status, String category, 
                              String description, LocalDateTime createdAt) {
        this.id = id;
        this.accountId = accountId;
        this.payeeName = payeeName;
        this.payeeAccountNumber = payeeAccountNumber;
        this.payeeRoutingNumber = payeeRoutingNumber;
        this.amount = amount;
        this.frequency = frequency;
        this.paymentDay = paymentDay;
        this.startDate = startDate;
        this.endDate = endDate;
        this.nextPaymentDate = nextPaymentDate;
        this.lastPaymentDate = lastPaymentDate;
        this.active = active;
        this.status = status;
        this.category = category;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

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

    public LocalDateTime getNextPaymentDate() {
        return nextPaymentDate;
    }

    public void setNextPaymentDate(LocalDateTime nextPaymentDate) {
        this.nextPaymentDate = nextPaymentDate;
    }

    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

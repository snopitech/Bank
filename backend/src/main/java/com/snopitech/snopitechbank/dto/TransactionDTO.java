package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class TransactionDTO {

    private Long id;
    private Long accountId;
    private String type;
    private Double amount;
    private LocalDateTime timestamp;
    private String description;

    private Long targetAccountId;
    private Double balanceAfter;

    // Category (BILLS, FOOD, TRANSFER, SALARY, etc.)
    private String category;

    // Reason / purpose / note for transfer or deposit
    private String note;

    public TransactionDTO() {}

    // GETTERS
    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getType() { return type; }
    public Double getAmount() { return amount; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getDescription() { return description; }
    public Long getTargetAccountId() { return targetAccountId; }
    public Double getBalanceAfter() { return balanceAfter; }
    public String getCategory() { return category; }
    public String getNote() { return note; }

    // SETTERS
    public void setId(Long id) { this.id = id; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public void setType(String type) { this.type = type; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setDescription(String description) { this.description = description; }
    public void setTargetAccountId(Long targetAccountId) { this.targetAccountId = targetAccountId; }
    public void setBalanceAfter(Double balanceAfter) { this.balanceAfter = balanceAfter; }
    public void setCategory(String category) { this.category = category; }
    public void setNote(String note) { this.note = note; }
}

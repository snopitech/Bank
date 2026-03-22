package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;
    private double amount;
    private String type; // DEPOSIT, WITHDRAWAL, TRANSFER, TRANSFER_IN
    private double balanceAfter;
    private LocalDateTime timestamp;

    private Long targetAccountId;
    private String description;

    // ⭐ NEW FIELD: Category (FOOD, BILLS, SHOPPING, SALARY, TRANSFER, UTILITIES, etc.)
    private String category;

    public Transaction() {}

    // Constructor used by service layer
    public Transaction(Long accountId, double amount, String type, double balanceAfter) {
        this.accountId = accountId;
        this.amount = amount;
        this.type = type;
        this.balanceAfter = balanceAfter;
        this.timestamp = LocalDateTime.now();
    }

    // Optional full constructor
    public Transaction(Long accountId, double amount, String type,
                       double balanceAfter, Long targetAccountId, String description) {
        this.accountId = accountId;
        this.amount = amount;
        this.type = type;
        this.balanceAfter = balanceAfter;
        this.targetAccountId = targetAccountId;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }

    // GETTERS
    public Long getId() {
        return id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public double getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Long getTargetAccountId() {
        return targetAccountId;
    }

    public String getDescription() {
        return description;
    }

    // ⭐ NEW GETTER
    public String getCategory() {
        return category;
    }

    // SETTERS
    public void setId(Long id) {
        this.id = id;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setBalanceAfter(double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setTargetAccountId(Long targetAccountId) {
        this.targetAccountId = targetAccountId;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ⭐ NEW SETTER
    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getDate() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getDate'");
    }

    public void setDate(LocalDateTime minusDays) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setDate'");
    }
}

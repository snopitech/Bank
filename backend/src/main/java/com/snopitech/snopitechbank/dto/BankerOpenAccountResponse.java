package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class BankerOpenAccountResponse {

    private boolean success;
    private String message;
    private String accountNumber;
    private String accountType;
    private Double balance;
    private String routingNumber;
    private Long openedByEmployeeId;
    private LocalDateTime openedAt;

    // Constructors
    public BankerOpenAccountResponse() {}

    // Success constructor
    public BankerOpenAccountResponse(boolean success, String message, String accountNumber,
                                      String accountType, Double balance, String routingNumber,
                                      Long openedByEmployeeId, LocalDateTime openedAt) {
        this.success = success;
        this.message = message;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.balance = balance;
        this.routingNumber = routingNumber;
        this.openedByEmployeeId = openedByEmployeeId;
        this.openedAt = openedAt;
    }

    // Error constructor
    public BankerOpenAccountResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public String getRoutingNumber() {
        return routingNumber;
    }

    public void setRoutingNumber(String routingNumber) {
        this.routingNumber = routingNumber;
    }

    public Long getOpenedByEmployeeId() {
        return openedByEmployeeId;
    }

    public void setOpenedByEmployeeId(Long openedByEmployeeId) {
        this.openedByEmployeeId = openedByEmployeeId;
    }

    public LocalDateTime getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(LocalDateTime openedAt) {
        this.openedAt = openedAt;
    }
}
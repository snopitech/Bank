package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class CustomerOpenAccountResponse {
    private boolean success;
    private String message;
    private String accountNumber;
    private String accountType;
    private Double balance;
    private String routingNumber;
    private LocalDateTime openedAt;
    
    public CustomerOpenAccountResponse() {}
    
    public CustomerOpenAccountResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public CustomerOpenAccountResponse(boolean success, String message, String accountNumber,
                                        String accountType, Double balance, String routingNumber,
                                        LocalDateTime openedAt) {
        this.success = success;
        this.message = message;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.balance = balance;
        this.routingNumber = routingNumber;
        this.openedAt = openedAt;
    }
    
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
    
    public LocalDateTime getOpenedAt() {
        return openedAt;
    }
    
    public void setOpenedAt(LocalDateTime openedAt) {
        this.openedAt = openedAt;
    }
}
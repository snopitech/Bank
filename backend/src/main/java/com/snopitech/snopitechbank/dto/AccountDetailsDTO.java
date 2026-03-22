package com.snopitech.snopitechbank.dto;

public class AccountDetailsDTO {

    private Long id;
    private String ownerName;
    private Double balance;
    private String accountType;
    private String accountNumber;
    private String routingNumber;

    // ⭐ REQUIRED CONSTRUCTOR (fixes your red lines)
    public AccountDetailsDTO(Long id, String ownerName, String accountType,
                             String accountNumber, String routingNumber, Double balance) {
        this.id = id;
        this.ownerName = ownerName;
        this.accountType = accountType;
        this.accountNumber = accountNumber;
        this.routingNumber = routingNumber;
        this.balance = balance;
    }

    // Empty constructor (optional but useful)
    public AccountDetailsDTO() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getRoutingNumber() { return routingNumber; }
    public void setRoutingNumber(String routingNumber) { this.routingNumber = routingNumber; }
}

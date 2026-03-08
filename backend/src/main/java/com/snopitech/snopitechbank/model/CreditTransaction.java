package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "credit_account_id", nullable = false)
    private CreditAccount creditAccount;

    @ManyToOne
    @JoinColumn(name = "credit_card_id")
    private CreditCard creditCard; // Which card was used (optional for payments)

    private Double amount;
    private String type; // PURCHASE, PAYMENT, FEE, INTEREST, REFUND, ADJUSTMENT
    private String status; // PENDING, COMPLETED, FAILED, REVERSED
    private LocalDateTime timestamp;

    private String merchant; // For purchases
    private String description; // Additional details
    private String category; // FOOD, SHOPPING, TRAVEL, etc.
    private Double balanceAfter; // Credit account balance after transaction
    
    private String referenceNumber; // Unique reference for the transaction
    private String authorizationCode; // For approved transactions

    // Constructors
    public CreditTransaction() {
        this.timestamp = LocalDateTime.now();
    }

    public CreditTransaction(CreditAccount creditAccount, Double amount, String type, String status) {
        this.creditAccount = creditAccount;
        this.amount = amount;
        this.type = type;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CreditAccount getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(CreditAccount creditAccount) {
        this.creditAccount = creditAccount;
    }

    public CreditCard getCreditCard() {
        return creditCard;
    }

    public void setCreditCard(CreditCard creditCard) {
        this.creditCard = creditCard;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getAuthorizationCode() {
        return authorizationCode;
    }

    public void setAuthorizationCode(String authorizationCode) {
        this.authorizationCode = authorizationCode;
    }
}
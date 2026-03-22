package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "credit_accounts")
public class CreditAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user; // Account owner

    @Column(nullable = false, unique = true)
    private String accountNumber; // Unique credit account number

    @Column(nullable = false)
    private Double creditLimit; // Current limit (5000, 10000, 15000, 20000)

    @Column(nullable = false)
    private Double currentBalance; // Amount used

    @Column(nullable = false)
    private Double availableCredit; // creditLimit - currentBalance

    @Column(nullable = false)
    private String status; // ACTIVE, CLOSED, FROZEN

    @Column(nullable = false)
    private LocalDateTime openedDate;

    private LocalDateTime closedDate;
    private String closureReason;

    // Credit terms
    private Double interestRate; // e.g., 18.99% APR
    private Integer paymentDueDay; // Day of month payment is due (e.g., 15)
    private Double minimumPaymentPercentage; // e.g., 2% of balance
    private Double minimumPaymentAmount; // e.g., $25 minimum

    // Tracking
    private Integer increaseCount; // 1 = 5k, 2 = 10k, 3 = 15k, 4 = 20k (max)
    private LocalDateTime lastPaymentDate;
    private LocalDateTime lastStatementDate;

    // Links
    @OneToOne(mappedBy = "creditAccount")
    @JsonIgnore
    private CreditApplication approvedApplication; // The application that created this account

    @OneToMany(mappedBy = "creditAccount", cascade = CascadeType.ALL)
    private List<CreditCard> cards = new ArrayList<>();

    // Constructors
    public CreditAccount() {
        this.openedDate = LocalDateTime.now();
        this.status = "ACTIVE";
        this.currentBalance = 0.0;
    }

    public CreditAccount(User user, Double creditLimit) {
        this.user = user;
        this.creditLimit = creditLimit;
        this.currentBalance = 0.0;
        this.availableCredit = creditLimit;
        this.openedDate = LocalDateTime.now();
        this.status = "ACTIVE";
        this.increaseCount = 1; // First account is 5k
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
        this.availableCredit = creditLimit - this.currentBalance;
    }

    public Double getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Double currentBalance) {
        this.currentBalance = currentBalance;
        this.availableCredit = this.creditLimit - currentBalance;
    }

    public Double getAvailableCredit() {
        return availableCredit;
    }

    // No setter for availableCredit - it's calculated

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getOpenedDate() {
        return openedDate;
    }

    public void setOpenedDate(LocalDateTime openedDate) {
        this.openedDate = openedDate;
    }

    public LocalDateTime getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(LocalDateTime closedDate) {
        this.closedDate = closedDate;
    }

    public String getClosureReason() {
        return closureReason;
    }

    public void setClosureReason(String closureReason) {
        this.closureReason = closureReason;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getPaymentDueDay() {
        return paymentDueDay;
    }

    public void setPaymentDueDay(Integer paymentDueDay) {
        this.paymentDueDay = paymentDueDay;
    }

    public Double getMinimumPaymentPercentage() {
        return minimumPaymentPercentage;
    }

    public void setMinimumPaymentPercentage(Double minimumPaymentPercentage) {
        this.minimumPaymentPercentage = minimumPaymentPercentage;
    }

    public Double getMinimumPaymentAmount() {
        return minimumPaymentAmount;
    }

    public void setMinimumPaymentAmount(Double minimumPaymentAmount) {
        this.minimumPaymentAmount = minimumPaymentAmount;
    }

    public Integer getIncreaseCount() {
        return increaseCount;
    }

    public void setIncreaseCount(Integer increaseCount) {
        this.increaseCount = increaseCount;
    }

    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }

    public LocalDateTime getLastStatementDate() {
        return lastStatementDate;
    }

    public void setLastStatementDate(LocalDateTime lastStatementDate) {
        this.lastStatementDate = lastStatementDate;
    }

    public CreditApplication getApprovedApplication() {
        return approvedApplication;
    }

    public void setApprovedApplication(CreditApplication approvedApplication) {
        this.approvedApplication = approvedApplication;
    }

    public List<CreditCard> getCards() {
        return cards;
    }

    public void setCards(List<CreditCard> cards) {
        this.cards = cards;
    }

    // Helper methods
    public void addCard(CreditCard card) {
        cards.add(card);
        card.setCreditAccount(this);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean isClosed() {
        return "CLOSED".equals(status);
    }

    public boolean isFrozen() {
        return "FROZEN".equals(status);
    }

    public boolean canRequestIncrease() {
        return increaseCount < 4; // Can request up to 4 increases (5k → 10k → 15k → 20k)
    }

    public Double getNextLimit() {
        switch(increaseCount) {
            case 1: return 10000.0; // 5k → 10k
            case 2: return 15000.0; // 10k → 15k
            case 3: return 20000.0; // 15k → 20k
            default: return creditLimit; // Max reached
        }
    }

    public String getMaskedAccountNumber() {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
}
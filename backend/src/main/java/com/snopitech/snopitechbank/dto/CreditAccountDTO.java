package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@SuppressWarnings("unused")
public class CreditAccountDTO {

    private Long id;
    private Long userId;
    private String accountNumber;
    private String maskedAccountNumber;
    private Double creditLimit;
    private Double currentBalance;
    private Double availableCredit;
    private String status;
    private LocalDateTime openedDate;
    private LocalDateTime closedDate;
    private String closureReason;
    
    // Credit terms
    private Double interestRate;
    private Integer paymentDueDay;
    private Double minimumPaymentPercentage;
    private Double minimumPaymentAmount;
    
    // Tracking
    private Integer increaseCount;
    private LocalDateTime lastPaymentDate;
    private LocalDateTime lastStatementDate;
    
    // Cards
    private List<CreditCardDTO> cards;
    
    // Application reference
    private Long applicationId;
    private String applicationStatus;
    
    // Helper booleans
    private boolean isActive;
    private boolean isClosed;
    private boolean isFrozen;

    // Constructors
    public CreditAccountDTO() {}

    public CreditAccountDTO(Long id, Long userId, String accountNumber, Double creditLimit,
                            Double currentBalance, Double availableCredit, String status,
                            LocalDateTime openedDate, LocalDateTime closedDate, String closureReason,
                            Double interestRate, Integer paymentDueDay, Double minimumPaymentPercentage,
                            Double minimumPaymentAmount, Integer increaseCount,
                            LocalDateTime lastPaymentDate, LocalDateTime lastStatementDate,
                            List<CreditCardDTO> cards, Long applicationId) {
        this.id = id;
        this.userId = userId;
        this.accountNumber = accountNumber;
        this.maskedAccountNumber = maskAccountNumber(accountNumber);
        this.creditLimit = creditLimit;
        this.currentBalance = currentBalance;
        this.availableCredit = availableCredit;
        this.status = status;
        this.openedDate = openedDate;
        this.closedDate = closedDate;
        this.closureReason = closureReason;
        this.interestRate = interestRate;
        this.paymentDueDay = paymentDueDay;
        this.minimumPaymentPercentage = minimumPaymentPercentage;
        this.minimumPaymentAmount = minimumPaymentAmount;
        this.increaseCount = increaseCount;
        this.lastPaymentDate = lastPaymentDate;
        this.lastStatementDate = lastStatementDate;
        this.cards = cards;
        this.applicationId = applicationId;
        
        this.isActive = "ACTIVE".equals(status);
        this.isClosed = "CLOSED".equals(status);
        this.isFrozen = "FROZEN".equals(status);
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) return "****";
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }

    // Helper methods
    public boolean isActive() {
        return isActive;
    }

    public boolean isClosed() {
        return isClosed;
    }

    public boolean isFrozen() {
        return isFrozen;
    }

    public boolean canRequestIncrease() {
        return increaseCount != null && increaseCount < 4 && "ACTIVE".equals(status);
    }

    public Double getNextLimit() {
        if (increaseCount == null) return null;
        switch(increaseCount) {
            case 1: return 10000.0;
            case 2: return 15000.0;
            case 3: return 20000.0;
            default: return creditLimit;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
        this.maskedAccountNumber = maskAccountNumber(accountNumber);
    }

    public String getMaskedAccountNumber() {
        return maskedAccountNumber;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public Double getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Double currentBalance) {
        this.currentBalance = currentBalance;
        this.availableCredit = creditLimit - currentBalance;
    }

    public Double getAvailableCredit() {
        return availableCredit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.isActive = "ACTIVE".equals(status);
        this.isClosed = "CLOSED".equals(status);
        this.isFrozen = "FROZEN".equals(status);
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

    public List<CreditCardDTO> getCards() {
        return cards;
    }

    public void setCards(List<CreditCardDTO> cards) {
        this.cards = cards;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
}

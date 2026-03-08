package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(name = "loan_accounts")
public class LoanAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ USER RELATIONSHIP
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ⭐ LINK TO ORIGINAL APPLICATION
    @OneToOne
    @JoinColumn(name = "application_id", unique = true)
    private LoanApplication application;

    // ⭐ ACCOUNT DETAILS
    @Column(nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Column(nullable = false)
    private Double approvedAmount;

    @Column(nullable = false)
    private Double outstandingBalance;

    @Column(nullable = false)
    private Double interestRate; // Annual interest rate (e.g., 8.5 for 8.5%)

    @Column(nullable = false)
    private Double monthlyPayment;

    @Column(nullable = false)
    private Integer termMonths;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate maturityDate;

    @Column(nullable = false)
    private LocalDate nextPaymentDate;

    @Column(nullable = false)
    private Integer paymentsMade = 0;

    @Column(nullable = false)
    private Integer totalPayments;

    // ⭐ STATUS
    @Column(nullable = false, length = 20)
    private String status; // ACTIVE, PAID, DEFAULTED, DELINQUENT

    @Column(length = 255)
    private String statusReason;

    // ⭐ TIMESTAMPS
    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastPaymentDate;
    private LocalDateTime closedDate;
    private LocalDateTime defaultedDate;

    // ⭐ CONSTRUCTORS
    public LoanAccount() {
        this.createdAt = LocalDateTime.now();
    }

    public LoanAccount(User user, LoanApplication application, Double approvedAmount, 
                       Double interestRate, Integer termMonths) {
        this.user = user;
        this.application = application;
        this.approvedAmount = approvedAmount;
        this.outstandingBalance = approvedAmount;
        this.interestRate = interestRate;
        this.termMonths = termMonths;
        this.totalPayments = termMonths; // Assuming monthly payments
        this.startDate = LocalDate.now();
        this.maturityDate = startDate.plusMonths(termMonths);
        this.nextPaymentDate = startDate.plusMonths(1);
        this.accountNumber = generateAccountNumber();
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        
        // Calculate monthly payment (simple interest formula)
        double monthlyRate = interestRate / 100 / 12;
        double factor = Math.pow(1 + monthlyRate, termMonths);
        this.monthlyPayment = approvedAmount * (monthlyRate * factor) / (factor - 1);
    }

    // ⭐ GENERATE UNIQUE ACCOUNT NUMBER
    private String generateAccountNumber() {
        Random random = new Random();
        int prefix = 10000 + random.nextInt(90000); // 10000-99999
        int suffix = 10000 + random.nextInt(90000);
        return "LN-" + prefix + "-" + suffix;
    }

    // ⭐ GETTERS AND SETTERS
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LoanApplication getApplication() {
        return application;
    }

    public void setApplication(LoanApplication application) {
        this.application = application;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getApprovedAmount() {
        return approvedAmount;
    }

    public void setApprovedAmount(Double approvedAmount) {
        this.approvedAmount = approvedAmount;
    }

    public Double getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(Double outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Double getMonthlyPayment() {
        return monthlyPayment;
    }

    public void setMonthlyPayment(Double monthlyPayment) {
        this.monthlyPayment = monthlyPayment;
    }

    public Integer getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(Integer termMonths) {
        this.termMonths = termMonths;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }

    public LocalDate getNextPaymentDate() {
        return nextPaymentDate;
    }

    public void setNextPaymentDate(LocalDate nextPaymentDate) {
        this.nextPaymentDate = nextPaymentDate;
    }

    public Integer getPaymentsMade() {
        return paymentsMade;
    }

    public void setPaymentsMade(Integer paymentsMade) {
        this.paymentsMade = paymentsMade;
    }

    public Integer getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(Integer totalPayments) {
        this.totalPayments = totalPayments;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusReason() {
        return statusReason;
    }

    public void setStatusReason(String statusReason) {
        this.statusReason = statusReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }

    public LocalDateTime getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(LocalDateTime closedDate) {
        this.closedDate = closedDate;
    }

    public LocalDateTime getDefaultedDate() {
        return defaultedDate;
    }

    public void setDefaultedDate(LocalDateTime defaultedDate) {
        this.defaultedDate = defaultedDate;
    }

    // ⭐ CONVENIENCE METHODS

    public String getMaskedAccountNumber() {
        if (accountNumber == null || accountNumber.length() < 8) {
            return "LN-****";
        }
        return "LN-****-" + accountNumber.substring(accountNumber.length() - 4);
    }

    public Double getPrincipalPaid() {
        return approvedAmount - outstandingBalance;
    }

    public Double getPercentPaid() {
        if (approvedAmount == 0) return 0.0;
        return (getPrincipalPaid() / approvedAmount) * 100;
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean isPaid() {
        return "PAID".equals(status);
    }

    public boolean isDefaulted() {
        return "DEFAULTED".equals(status);
    }

    public boolean isDelinquent() {
        return "DELINQUENT".equals(status);
    }

    public void makePayment(Double amount) {
        if (!isActive()) {
            throw new RuntimeException("Loan is not active");
        }
        
        if (amount > outstandingBalance) {
            amount = outstandingBalance; // Pay off remaining balance
        }
        
        this.outstandingBalance -= amount;
        this.paymentsMade++;
        this.lastPaymentDate = LocalDateTime.now();
        
        // Update next payment date
        if (outstandingBalance > 0) {
            this.nextPaymentDate = this.nextPaymentDate.plusMonths(1);
        } else {
            this.status = "PAID";
            this.closedDate = LocalDateTime.now();
        }
    }

    public void markDelinquent(String reason) {
        this.status = "DELINQUENT";
        this.statusReason = reason;
    }

    public void markDefaulted(String reason) {
        this.status = "DEFAULTED";
        this.statusReason = reason;
        this.defaultedDate = LocalDateTime.now();
    }

    public long getRemainingMonths() {
        if (outstandingBalance <= 0) return 0;
        return java.time.temporal.ChronoUnit.MONTHS.between(LocalDate.now(), maturityDate);
    }

    public Double getTotalDue() {
    return outstandingBalance + (outstandingBalance * 0.025);
    }

    @Override
    public String toString() {
        return "LoanAccount{" +
                "id=" + id +
                ", accountNumber='" + getMaskedAccountNumber() + '\'' +
                ", approvedAmount=" + approvedAmount +
                ", outstandingBalance=" + outstandingBalance +
                ", status=" + status +
                '}';
    }
}
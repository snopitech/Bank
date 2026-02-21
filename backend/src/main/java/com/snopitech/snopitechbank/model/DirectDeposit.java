package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "direct_deposits")
public class DirectDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String employerName;

    @Column(nullable = false)
    private String employerRoutingNumber;

    @Column(nullable = false)
    private String employerAccountNumber;

    @Column(nullable = false)
    private Double depositAmount;

    @Column(nullable = false)
    private String frequency; // WEEKLY, BIWEEKLY, MONTHLY, SEMI_MONTHLY

    @Column(nullable = false)
    private LocalDateTime setupDate;

    private LocalDateTime lastDepositDate;
    
    private LocalDateTime nextDepositDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean isPrimaryDeposit = false;

    private String depositType; // PAYROLL, BENEFITS, PENSION, etc.

    private String status; // ACTIVE, PENDING, SUSPENDED, CANCELLED

    // Constructors
    public DirectDeposit() {
        this.setupDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getEmployerRoutingNumber() {
        return employerRoutingNumber;
    }

    public void setEmployerRoutingNumber(String employerRoutingNumber) {
        this.employerRoutingNumber = employerRoutingNumber;
    }

    public String getEmployerAccountNumber() {
        return employerAccountNumber;
    }

    public void setEmployerAccountNumber(String employerAccountNumber) {
        this.employerAccountNumber = employerAccountNumber;
    }

    public Double getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(Double depositAmount) {
        this.depositAmount = depositAmount;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDateTime getSetupDate() {
        return setupDate;
    }

    public void setSetupDate(LocalDateTime setupDate) {
        this.setupDate = setupDate;
    }

    public LocalDateTime getLastDepositDate() {
        return lastDepositDate;
    }

    public void setLastDepositDate(LocalDateTime lastDepositDate) {
        this.lastDepositDate = lastDepositDate;
    }

    public LocalDateTime getNextDepositDate() {
        return nextDepositDate;
    }

    public void setNextDepositDate(LocalDateTime nextDepositDate) {
        this.nextDepositDate = nextDepositDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getIsPrimaryDeposit() {
        return isPrimaryDeposit;
    }

    public void setIsPrimaryDeposit(Boolean isPrimaryDeposit) {
        this.isPrimaryDeposit = isPrimaryDeposit;
    }

    public String getDepositType() {
        return depositType;
    }

    public void setDepositType(String depositType) {
        this.depositType = depositType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

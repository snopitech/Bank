package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class DirectDepositDTO {
    
    private Long id;
    private Long accountId;
    private String employerName;
    private String employerRoutingNumber;
    private String employerAccountNumber;
    private Double depositAmount;
    private String frequency;
    private LocalDateTime setupDate;
    private LocalDateTime lastDepositDate;
    private LocalDateTime nextDepositDate;
    private Boolean active;
    private Boolean isPrimaryDeposit;
    private String depositType;
    private String status;

    // Constructors
    public DirectDepositDTO() {}

    public DirectDepositDTO(Long id, Long accountId, String employerName, 
                           String employerRoutingNumber, String employerAccountNumber,
                           Double depositAmount, String frequency, LocalDateTime setupDate,
                           LocalDateTime lastDepositDate, LocalDateTime nextDepositDate,
                           Boolean active, Boolean isPrimaryDeposit, String depositType, 
                           String status) {
        this.id = id;
        this.accountId = accountId;
        this.employerName = employerName;
        this.employerRoutingNumber = employerRoutingNumber;
        this.employerAccountNumber = employerAccountNumber;
        this.depositAmount = depositAmount;
        this.frequency = frequency;
        this.setupDate = setupDate;
        this.lastDepositDate = lastDepositDate;
        this.nextDepositDate = nextDepositDate;
        this.active = active;
        this.isPrimaryDeposit = isPrimaryDeposit;
        this.depositType = depositType;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
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
package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;

public class CreateDirectDepositRequest {

    @NotBlank(message = "Employer name is required")
    private String employerName;

    @NotBlank(message = "Employer routing number is required")
    @Pattern(regexp = "^[0-9]{9}$", message = "Routing number must be 9 digits")
    private String employerRoutingNumber;

    @NotBlank(message = "Employer account number is required")
    private String employerAccountNumber;

    @NotNull(message = "Deposit amount is required")
    @Positive(message = "Deposit amount must be positive")
    private Double depositAmount;

    @NotBlank(message = "Frequency is required")
    @Pattern(regexp = "WEEKLY|BIWEEKLY|MONTHLY|SEMI_MONTHLY", 
             message = "Frequency must be WEEKLY, BIWEEKLY, MONTHLY, or SEMI_MONTHLY")
    private String frequency;

    private Boolean isPrimaryDeposit = false;

    @Pattern(regexp = "PAYROLL|BENEFITS|PENSION|OTHER", 
             message = "Deposit type must be PAYROLL, BENEFITS, PENSION, or OTHER")
    private String depositType = "PAYROLL";

    // Getters and Setters
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
}
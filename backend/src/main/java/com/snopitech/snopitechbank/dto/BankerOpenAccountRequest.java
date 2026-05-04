package com.snopitech.snopitechbank.dto;

public class BankerOpenAccountRequest {

    private Long employeeId;
    private Long customerId;
    private String accountType;  // CHECKING or SAVINGS only (not BUSINESS)
    private Double initialDeposit;  // Can be 0 or any positive amount

    // Constructors
    public BankerOpenAccountRequest() {}

    public BankerOpenAccountRequest(Long employeeId, Long customerId, 
                                     String accountType, Double initialDeposit) {
        this.employeeId = employeeId;
        this.customerId = customerId;
        this.accountType = accountType;
        this.initialDeposit = initialDeposit;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Double getInitialDeposit() {
        return initialDeposit;
    }

    public void setInitialDeposit(Double initialDeposit) {
        this.initialDeposit = initialDeposit;
    }

    // Validation helper
    public boolean isValid() {
        if (employeeId == null || customerId == null || accountType == null) {
            return false;
        }
        if (!accountType.equals("CHECKING") && !accountType.equals("SAVINGS")) {
            return false;
        }
        if (initialDeposit == null || initialDeposit < 0) {
            return false;
        }
        return true;
    }
}
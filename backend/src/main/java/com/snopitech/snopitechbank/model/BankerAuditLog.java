package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banker_audit_log")
public class BankerAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who performed the action
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    // Which customer
    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    // What action
    @Column(name = "action_type", nullable = false)
    private String actionType;  // OPEN_CHECKING, OPEN_SAVINGS, SUBMIT_BUSINESS_APP

    // Account details (if applicable)
    @Column(name = "account_type")
    private String accountType;  // CHECKING, SAVINGS, BUSINESS

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "initial_deposit")
    private Double initialDeposit;

    // Business application details (if applicable)
    @Column(name = "business_application_id")
    private Long businessApplicationId;

    @Column(name = "business_name")
    private String businessName;

    // Result
    @Column(name = "status", nullable = false)
    private String status;  // SUCCESS, FAILED

    @Column(name = "failure_reason")
    private String failureReason;

    // Timestamp
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    // Constructors
    public BankerAuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    // Convenience constructor for success
    public BankerAuditLog(Long employeeId, String employeeName, Long customerId, 
                          String customerEmail, String actionType, String status) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.customerId = customerId;
        this.customerEmail = customerEmail;
        this.actionType = actionType;
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

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getInitialDeposit() {
        return initialDeposit;
    }

    public void setInitialDeposit(Double initialDeposit) {
        this.initialDeposit = initialDeposit;
    }

    public Long getBusinessApplicationId() {
        return businessApplicationId;
    }

    public void setBusinessApplicationId(Long businessApplicationId) {
        this.businessApplicationId = businessApplicationId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stop_payments")
public class StopPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "check_number")
    private String checkNumber;  // Specific check number or range

    @Column(name = "payee_name")
    private String payeeName;     // Who the check was written to

    @Column(name = "amount")
    private Double amount;         // Amount of the check

    @Column(name = "check_date")
    private LocalDate checkDate;   // Date on the check

    @Column(name = "reason", length = 500)
    private String reason;         // Why stop payment was requested

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, RELEASED, EXPIRED

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate; // Typically 6 months from request

    @Column(name = "fee_charged")
    private Double feeCharged = 0.0;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public StopPayment() {
        this.createdAt = LocalDateTime.now();
        this.requestDate = LocalDateTime.now();
        this.status = "ACTIVE";
        // Default expiration: 6 months from now
        this.expirationDate = LocalDate.now().plusMonths(6);
    }

    public StopPayment(Long accountId, String checkNumber, String reason) {
        this.accountId = accountId;
        this.checkNumber = checkNumber;
        this.reason = reason;
        this.status = "ACTIVE";
        this.requestDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.expirationDate = LocalDate.now().plusMonths(6);
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

    public String getCheckNumber() {
        return checkNumber;
    }

    public void setCheckNumber(String checkNumber) {
        this.checkNumber = checkNumber;
    }

    public String getPayeeName() {
        return payeeName;
    }

    public void setPayeeName(String payeeName) {
        this.payeeName = payeeName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getCheckDate() {
        return checkDate;
    }

    public void setCheckDate(LocalDate checkDate) {
        this.checkDate = checkDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public Double getFeeCharged() {
        return feeCharged;
    }

    public void setFeeCharged(Double feeCharged) {
        this.feeCharged = feeCharged;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean isActive() {
        return "ACTIVE".equals(this.status) && 
               (this.expirationDate == null || !this.expirationDate.isBefore(LocalDate.now()));
    }

    public boolean isExpired() {
        return this.expirationDate != null && this.expirationDate.isBefore(LocalDate.now());
    }

    public void release() {
        this.status = "RELEASED";
    }

    public void expire() {
        this.status = "EXPIRED";
    }
}
package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "overdrafts")
public class Overdraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false, unique = true)
    private Long accountId;

    @Column(name = "overdraft_enabled", nullable = false)
    private Boolean overdraftEnabled = false;

    @Column(name = "overdraft_limit")
    private Double overdraftLimit = 0.0;

    @Column(name = "current_overdraft_balance")
    private Double currentOverdraftBalance = 0.0;

    @Column(name = "auto_sweep_enabled", nullable = false)
    private Boolean autoSweepEnabled = false;

    @Column(name = "sweep_account_id")
    private Long sweepAccountId;

    @Column(name = "interest_rate")
    private Double interestRate = 0.0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Overdraft() {
        this.createdAt = LocalDateTime.now();
    }

    public Overdraft(Long accountId) {
        this.accountId = accountId;
        this.overdraftEnabled = false;
        this.overdraftLimit = 0.0;
        this.currentOverdraftBalance = 0.0;
        this.autoSweepEnabled = false;
        this.interestRate = 0.0;
        this.createdAt = LocalDateTime.now();
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

    public Boolean getOverdraftEnabled() {
        return overdraftEnabled;
    }

    public void setOverdraftEnabled(Boolean overdraftEnabled) {
        this.overdraftEnabled = overdraftEnabled;
    }

    public Double getOverdraftLimit() {
        return overdraftLimit;
    }

    public void setOverdraftLimit(Double overdraftLimit) {
        this.overdraftLimit = overdraftLimit;
    }

    public Double getCurrentOverdraftBalance() {
        return currentOverdraftBalance;
    }

    public void setCurrentOverdraftBalance(Double currentOverdraftBalance) {
        this.currentOverdraftBalance = currentOverdraftBalance;
    }

    public Boolean getAutoSweepEnabled() {
        return autoSweepEnabled;
    }

    public void setAutoSweepEnabled(Boolean autoSweepEnabled) {
        this.autoSweepEnabled = autoSweepEnabled;
    }

    public Long getSweepAccountId() {
        return sweepAccountId;
    }

    public void setSweepAccountId(Long sweepAccountId) {
        this.sweepAccountId = sweepAccountId;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
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

    // Helper method to check if account has overdraft protection
    public boolean hasOverdraftProtection() {
        return overdraftEnabled && overdraftLimit > 0;
    }

    // Helper method to get available overdraft amount
    public double getAvailableOverdraft() {
        if (!hasOverdraftProtection()) {
            return 0.0;
        }
        return overdraftLimit - currentOverdraftBalance;
    }

    // Helper method to check if overdraft is fully utilized
    public boolean isOverdraftFullyUtilized() {
        return hasOverdraftProtection() && currentOverdraftBalance >= overdraftLimit;
    }
}
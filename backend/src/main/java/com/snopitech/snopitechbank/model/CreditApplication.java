package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.snopitech.snopitechbank.dto.CreditApplicationDTO;

@SuppressWarnings("unused")
@Entity
@Table(name = "credit_applications")
public class CreditApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user; // Applicant

    @Column(nullable = false)
    private String applicationType; // "NEW_ACCOUNT" or "INCREASE_REQUEST"

    // For new account applications, this will be 5000.00
    // For increase requests, this will be 10000, 15000, or 20000
    @Column(nullable = false)
    private Double requestedLimit;

    // Reason for application
    @Column(columnDefinition = "TEXT")
    private String reason;

    // NEW FIELDS for comprehensive credit application
    @Column(length = 50)
    private String creditPurpose; // DEBT_CONSOLIDATION, HOME_IMPROVEMENT, MAJOR_PURCHASE, BUSINESS, EMERGENCY, OTHER

    @Column
    private Double monthlyHousingPayment; // Rent or mortgage payment

    @Column
    private Integer yearsAtCurrentAddress;

    @Column(columnDefinition = "TEXT")
    private String previousAddress; // If less than 2 years at current address

    @Column(length = 50)
    private String citizenshipStatus; // US_CITIZEN, PERMANENT_RESIDENT, OTHER

    @Column
    private Boolean agreeToTerms;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(nullable = false)
    private LocalDateTime submittedDate;

    private LocalDateTime reviewedDate;

    private String reviewedBy; // Admin who reviewed

    private String rejectionReason; // If rejected

    // Link to the credit account once approved
    @OneToOne
    @JoinColumn(name = "credit_account_id")
    @JsonIgnore
    private CreditAccount creditAccount;

    // For tracking which increase number this is (1st, 2nd, 3rd, 4th)
    private Integer increaseAttempt; // 1 = 5k, 2 = 10k, 3 = 15k, 4 = 20k

    // Constructors
    public CreditApplication() {
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
    }

    public CreditApplication(User user, Double requestedLimit, String applicationType) {
        this.user = user;
        this.requestedLimit = requestedLimit;
        this.applicationType = applicationType;
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
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

    public String getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(String applicationType) {
        this.applicationType = applicationType;
    }

    public Double getRequestedLimit() {
        return requestedLimit;
    }

    public void setRequestedLimit(Double requestedLimit) {
        this.requestedLimit = requestedLimit;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getCreditPurpose() {
        return creditPurpose;
    }

    public void setCreditPurpose(String creditPurpose) {
        this.creditPurpose = creditPurpose;
    }

    public Double getMonthlyHousingPayment() {
        return monthlyHousingPayment;
    }

    public void setMonthlyHousingPayment(Double monthlyHousingPayment) {
        this.monthlyHousingPayment = monthlyHousingPayment;
    }

    public Integer getYearsAtCurrentAddress() {
        return yearsAtCurrentAddress;
    }

    public void setYearsAtCurrentAddress(Integer yearsAtCurrentAddress) {
        this.yearsAtCurrentAddress = yearsAtCurrentAddress;
    }

    public String getPreviousAddress() {
        return previousAddress;
    }

    public void setPreviousAddress(String previousAddress) {
        this.previousAddress = previousAddress;
    }

    public String getCitizenshipStatus() {
        return citizenshipStatus;
    }

    public void setCitizenshipStatus(String citizenshipStatus) {
        this.citizenshipStatus = citizenshipStatus;
    }

    public Boolean getAgreeToTerms() {
        return agreeToTerms;
    }

    public void setAgreeToTerms(Boolean agreeToTerms) {
        this.agreeToTerms = agreeToTerms;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedDate() {
        return submittedDate;
    }

    public void setSubmittedDate(LocalDateTime submittedDate) {
        this.submittedDate = submittedDate;
    }

    public LocalDateTime getReviewedDate() {
        return reviewedDate;
    }

    public void setReviewedDate(LocalDateTime reviewedDate) {
        this.reviewedDate = reviewedDate;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public CreditAccount getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(CreditAccount creditAccount) {
        this.creditAccount = creditAccount;
    }

    public Integer getIncreaseAttempt() {
        return increaseAttempt;
    }

    public void setIncreaseAttempt(Integer increaseAttempt) {
        this.increaseAttempt = increaseAttempt;
    }

    // Helper methods
    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    public boolean isNewAccount() {
        return "NEW_ACCOUNT".equals(applicationType);
    }

    public boolean isIncreaseRequest() {
        return "INCREASE_REQUEST".equals(applicationType);
    }  
}
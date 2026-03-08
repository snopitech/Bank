package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SuppressWarnings("unused")
@Entity
@Table(name = "loan_applications")
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ⭐ USER INFORMATION
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // ⭐ LOAN DETAILS
    @Column(nullable = false)
    private Double requestedAmount;  // Between $100 and $1,000,000,000
    
    @Column(nullable = false, length = 50)
    private String loanPurpose;  // HOME, AUTO, BUSINESS, EDUCATION, PERSONAL, DEBT_CONSOLIDATION, OTHER
    
    @Column(columnDefinition = "TEXT")
    private String reason;  // Detailed reason for loan
    
    // ⭐ TERM DETAILS
    @Column(nullable = false)
    private Integer requestedTermMonths;  // 12, 24, 36, 48, 60, etc.
    
    // ⭐ EMPLOYMENT & INCOME
    @Column(length = 50)
    private String employmentStatus;
    
    private Double annualIncome;
    
    @Column(length = 100)
    private String employerName;
    
    private Integer yearsAtEmployer;
    
    // ⭐ EXISTING LOAN TRACKING
    @Column(nullable = false)
    private Integer existingLoanCount = 0;  // Number of existing loans (max 3)
    
    // ⭐ STATUS INFORMATION
    @Column(nullable = false, length = 20)
    private String status;  // PENDING, APPROVED, REJECTED
    
    @Column(columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(length = 100)
    private String reviewedBy;
    
    // ⭐ TIMESTAMPS
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    private LocalDateTime reviewedAt;
    
    // ⭐ CONSTRUCTORS
    public LoanApplication() {
        this.submittedAt = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    public LoanApplication(User user, Double requestedAmount, String loanPurpose, Integer requestedTermMonths) {
        this.user = user;
        this.requestedAmount = requestedAmount;
        this.loanPurpose = loanPurpose;
        this.requestedTermMonths = requestedTermMonths;
        this.submittedAt = LocalDateTime.now();
        this.status = "PENDING";
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

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public String getLoanPurpose() {
        return loanPurpose;
    }

    public void setLoanPurpose(String loanPurpose) {
        this.loanPurpose = loanPurpose;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getRequestedTermMonths() {
        return requestedTermMonths;
    }

    public void setRequestedTermMonths(Integer requestedTermMonths) {
        this.requestedTermMonths = requestedTermMonths;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public Integer getYearsAtEmployer() {
        return yearsAtEmployer;
    }

    public void setYearsAtEmployer(Integer yearsAtEmployer) {
        this.yearsAtEmployer = yearsAtEmployer;
    }

    public Integer getExistingLoanCount() {
        return existingLoanCount;
    }

    public void setExistingLoanCount(Integer existingLoanCount) {
        this.existingLoanCount = existingLoanCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    // ⭐ CONVENIENCE METHODS
    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    public void approve(String adminUsername) {
        this.status = "APPROVED";
        this.reviewedBy = adminUsername;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(String adminUsername, String reason) {
        this.status = "REJECTED";
        this.reviewedBy = adminUsername;
        this.adminNotes = reason;
        this.reviewedAt = LocalDateTime.now();
    }

    public boolean isAmountValid() {
        return requestedAmount >= 100 && requestedAmount <= 1_000_000_000;
    }

    public String getMaskedAmount() {
        if (requestedAmount == null) return "N/A";
        return String.format("$%,.2f", requestedAmount);
    }
}
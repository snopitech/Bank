package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "credit_increase_requests")
public class CreditIncreaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "credit_account_id", nullable = false)
    private CreditAccount creditAccount;

   @ManyToOne
@JoinColumn(name = "user_id", nullable = false)
@JsonIgnoreProperties({"password", "ssnEncrypted", "securityQuestions", "accounts", "sessionId", "resetToken", "resetTokenExpiry"})
private User user; // Requestor

    @Column(nullable = false)
    private Double currentLimit;

    @Column(nullable = false)
    private Double requestedLimit; // 10000, 15000, or 20000

    @Column(nullable = false)
    private Integer requestedIncreaseNumber; // 2 = 10k, 3 = 15k, 4 = 20k

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason; // Why they need the increase

    @Column(nullable = false)
    private String employmentStatus; // EMPLOYED, SELF_EMPLOYED, RETIRED, UNEMPLOYED

    private Double annualIncome; // For income verification

    private String employerName;

    private Integer yearsAtEmployer;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(nullable = false)
    private LocalDateTime submittedDate;

    private LocalDateTime reviewedDate;

    private String reviewedBy; // Admin who reviewed

    private String rejectionReason; // If rejected

    private String adminNotes; // Internal admin notes

    // Credit check information (if applicable)
    private Boolean creditCheckPerformed;
    private Integer creditScore;
    private LocalDateTime creditCheckDate;

    // For tracking
    private Boolean documentsVerified;
    private String documentPath; // Path to uploaded income docs

    // Constructors
    public CreditIncreaseRequest() {
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
        this.documentsVerified = false;
    }

    public CreditIncreaseRequest(CreditAccount creditAccount, User user, 
                                Double requestedLimit, String reason) {
        this.creditAccount = creditAccount;
        this.user = user;
        this.currentLimit = creditAccount.getCreditLimit();
        this.requestedLimit = requestedLimit;
        this.reason = reason;
        this.requestedIncreaseNumber = creditAccount.getIncreaseCount() + 1;
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
        this.documentsVerified = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CreditAccount getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(CreditAccount creditAccount) {
        this.creditAccount = creditAccount;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getCurrentLimit() {
        return currentLimit;
    }

    public void setCurrentLimit(Double currentLimit) {
        this.currentLimit = currentLimit;
    }

    public Double getRequestedLimit() {
        return requestedLimit;
    }

    public void setRequestedLimit(Double requestedLimit) {
        this.requestedLimit = requestedLimit;
    }

    public Integer getRequestedIncreaseNumber() {
        return requestedIncreaseNumber;
    }

    public void setRequestedIncreaseNumber(Integer requestedIncreaseNumber) {
        this.requestedIncreaseNumber = requestedIncreaseNumber;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public Boolean getCreditCheckPerformed() {
        return creditCheckPerformed;
    }

    public void setCreditCheckPerformed(Boolean creditCheckPerformed) {
        this.creditCheckPerformed = creditCheckPerformed;
    }

    public Integer getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }

    public LocalDateTime getCreditCheckDate() {
        return creditCheckDate;
    }

    public void setCreditCheckDate(LocalDateTime creditCheckDate) {
        this.creditCheckDate = creditCheckDate;
    }

    public Boolean getDocumentsVerified() {
        return documentsVerified;
    }

    public void setDocumentsVerified(Boolean documentsVerified) {
        this.documentsVerified = documentsVerified;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
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

    public boolean isValidIncrease() {
        // Check if the requested limit is one of the allowed amounts
        return requestedLimit.equals(10000.0) || 
               requestedLimit.equals(15000.0) || 
               requestedLimit.equals(20000.0);
    }

    public boolean isNextLogicalIncrease() {
        Double nextLimit = creditAccount.getNextLimit();
        return requestedLimit.equals(nextLimit);
    }

    public String getIncreaseDescription() {
        switch(requestedIncreaseNumber) {
            case 2: return "First Increase: $5,000 → $10,000";
            case 3: return "Second Increase: $10,000 → $15,000";
            case 4: return "Third Increase: $15,000 → $20,000";
            default: return "Invalid Increase Request";
        }
    }

    @Override
    public String toString() {
        return "CreditIncreaseRequest{" +
                "id=" + id +
                ", account=" + creditAccount.getMaskedAccountNumber() +
                ", requestedLimit=" + requestedLimit +
                ", status=" + status +
                '}';
    }
}

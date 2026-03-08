package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class CreditApplicationDTO {

    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    
    // Application details
    private String applicationType; // "NEW_ACCOUNT" or "INCREASE_REQUEST"
    private Double requestedLimit;
    private String reason;
    private String creditPurpose;
    private Double monthlyHousingPayment;
    private Integer yearsAtCurrentAddress;
    private String previousAddress;
    private String citizenshipStatus;
    private Boolean agreeToTerms;
    
    // Status tracking
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime submittedDate;
    private LocalDateTime reviewedDate;
    private String reviewedBy;
    private String rejectionReason;
    
    // Credit account reference (if approved)
    private Long creditAccountId;
    private String maskedAccountNumber;
    
    // Helper booleans
    private boolean isPending;
    private boolean isApproved;
    private boolean isRejected;
    private boolean isNewAccount;
    private boolean isIncreaseRequest;

    // Constructors
    public CreditApplicationDTO() {}

    public CreditApplicationDTO(Long id, Long userId, String userFirstName, String userLastName,
                                String userEmail, String applicationType, Double requestedLimit,
                                String reason, String creditPurpose, Double monthlyHousingPayment,
                                Integer yearsAtCurrentAddress, String previousAddress,
                                String citizenshipStatus, Boolean agreeToTerms, String status,
                                LocalDateTime submittedDate, LocalDateTime reviewedDate,
                                String reviewedBy, String rejectionReason, Long creditAccountId,
                                String maskedAccountNumber) {
        this.id = id;
        this.userId = userId;
        this.userFirstName = userFirstName;
        this.userLastName = userLastName;
        this.userEmail = userEmail;
        this.applicationType = applicationType;
        this.requestedLimit = requestedLimit;
        this.reason = reason;
        this.creditPurpose = creditPurpose;
        this.monthlyHousingPayment = monthlyHousingPayment;
        this.yearsAtCurrentAddress = yearsAtCurrentAddress;
        this.previousAddress = previousAddress;
        this.citizenshipStatus = citizenshipStatus;
        this.agreeToTerms = agreeToTerms;
        this.status = status;
        this.submittedDate = submittedDate;
        this.reviewedDate = reviewedDate;
        this.reviewedBy = reviewedBy;
        this.rejectionReason = rejectionReason;
        this.creditAccountId = creditAccountId;
        this.maskedAccountNumber = maskedAccountNumber;
        
        this.isPending = "PENDING".equals(status);
        this.isApproved = "APPROVED".equals(status);
        this.isRejected = "REJECTED".equals(status);
        this.isNewAccount = "NEW_ACCOUNT".equals(applicationType);
        this.isIncreaseRequest = "INCREASE_REQUEST".equals(applicationType);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserFirstName() {
        return userFirstName;
    }

    public void setUserFirstName(String userFirstName) {
        this.userFirstName = userFirstName;
    }

    public String getUserLastName() {
        return userLastName;
    }

    public void setUserLastName(String userLastName) {
        this.userLastName = userLastName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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
        this.isPending = "PENDING".equals(status);
        this.isApproved = "APPROVED".equals(status);
        this.isRejected = "REJECTED".equals(status);
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

    public Long getCreditAccountId() {
        return creditAccountId;
    }

    public void setCreditAccountId(Long creditAccountId) {
        this.creditAccountId = creditAccountId;
    }

    public String getMaskedAccountNumber() {
        return maskedAccountNumber;
    }

    public void setMaskedAccountNumber(String maskedAccountNumber) {
        this.maskedAccountNumber = maskedAccountNumber;
    }

    // Helper booleans
    public boolean isPending() {
        return isPending;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public boolean isRejected() {
        return isRejected;
    }

    public boolean isNewAccount() {
        return isNewAccount;
    }

    public boolean isIncreaseRequest() {
        return isIncreaseRequest;
    }

    public String getUserFullName() {
        return userFirstName + " " + userLastName;
    }
}
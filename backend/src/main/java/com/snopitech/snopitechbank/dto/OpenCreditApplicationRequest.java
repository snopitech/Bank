package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.*;

public class OpenCreditApplicationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must be less than 500 characters")
    private String reason;

    @NotBlank(message = "Credit purpose is required")
    private String creditPurpose; // DEBT_CONSOLIDATION, HOME_IMPROVEMENT, MAJOR_PURCHASE, BUSINESS, EMERGENCY, OTHER

    @NotNull(message = "Requested limit is required")
    @Min(value = 500, message = "Requested limit must be at least $500")
    @Max(value = 20000, message = "Requested limit cannot exceed $20,000")
    private Double requestedLimit;

    @Positive(message = "Monthly housing payment must be positive")
    private Double monthlyHousingPayment;

    @Min(value = 0, message = "Years at current address must be positive")
    private Integer yearsAtCurrentAddress;

    @Size(max = 200, message = "Previous address must be less than 200 characters")
    private String previousAddress;

    private String citizenshipStatus; // US_CITIZEN, PERMANENT_RESIDENT, OTHER

    @AssertTrue(message = "You must agree to the terms and conditions")
    private Boolean agreeToTerms;

    // Employment information (optional, can be pulled from user profile)
    private String employmentStatus;
    private String employerName;
    private String occupation;
    private Integer yearsAtEmployer;
    private Double annualIncome;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Double getRequestedLimit() {
        return requestedLimit;
    }

    public void setRequestedLimit(Double requestedLimit) {
        this.requestedLimit = requestedLimit;
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

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public Integer getYearsAtEmployer() {
        return yearsAtEmployer;
    }

    public void setYearsAtEmployer(Integer yearsAtEmployer) {
        this.yearsAtEmployer = yearsAtEmployer;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }
}
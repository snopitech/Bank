package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class BusinessAccountDTO {

    private Long id;
    private Long userId;
    private Long accountId;
    private Long cardId;
    private String businessName;
    private String ein;
    private String maskedEin;
    private String businessType;
    private String industry;
    private Integer yearsInOperation;
    private Double annualRevenue;
    private Integer numberOfEmployees;
    private String businessAddress;
    private String businessAddress2;
    private String businessCity;
    private String businessState;
    private String businessZipCode;
    private String businessCountry;
    private String fullBusinessAddress;
    private String businessPhone;
    private String businessEmail;
    private String website;
    private String legalStructure;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String status;
    private Boolean verified;
    private LocalDateTime verifiedDate;
    private Double estimatedMonthlyVolume;
    private Integer estimatedMonthlyTransactions;
    private boolean isActive;
    private boolean isClosed;
    
    // ===== NEW: Disabled field =====
    private boolean isDisabled;

    // ===== NEW: Application tracking fields =====
    private String applicationStatus;
    private LocalDateTime submittedDate;
    private LocalDateTime reviewedDate;
    private String reviewedBy;
    private String rejectionReason;

    // Account details (from linked account) - can be null for pending applications
    private String accountNumber;
    private Double accountBalance;
    private String accountType;

    // Card details (from linked card) - can be null for pending applications
    private String maskedCardNumber;
    private String cardStatus;

    // Constructors
    public BusinessAccountDTO() {}

    // Full constructor with all fields - UPDATED with disabled parameter
    public BusinessAccountDTO(Long id, Long userId, Long accountId, Long cardId,
                              String businessName, String ein, String businessType,
                              String industry, Integer yearsInOperation, Double annualRevenue,
                              Integer numberOfEmployees, String businessAddress,
                              String businessAddress2, String businessCity, String businessState,
                              String businessZipCode, String businessCountry, String businessPhone,
                              String businessEmail, String website, String legalStructure,
                              LocalDateTime createdDate, LocalDateTime updatedDate, String status,
                              Boolean verified, LocalDateTime verifiedDate,
                              Double estimatedMonthlyVolume, Integer estimatedMonthlyTransactions,
                              String accountNumber, Double accountBalance, String accountType,
                              String maskedCardNumber, String cardStatus,
                              boolean isDisabled) {  // ADDED this parameter
        this.id = id;
        this.userId = userId;
        this.accountId = accountId;
        this.cardId = cardId;
        this.businessName = businessName;
        this.ein = ein;
        this.maskedEin = maskEin(ein);
        this.businessType = businessType;
        this.industry = industry;
        this.yearsInOperation = yearsInOperation;
        this.annualRevenue = annualRevenue;
        this.numberOfEmployees = numberOfEmployees;
        this.businessAddress = businessAddress;
        this.businessAddress2 = businessAddress2;
        this.businessCity = businessCity;
        this.businessState = businessState;
        this.businessZipCode = businessZipCode;
        this.businessCountry = businessCountry;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
        this.businessPhone = businessPhone;
        this.businessEmail = businessEmail;
        this.website = website;
        this.legalStructure = legalStructure;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.status = status;
        this.verified = verified;
        this.verifiedDate = verifiedDate;
        this.estimatedMonthlyVolume = estimatedMonthlyVolume;
        this.estimatedMonthlyTransactions = estimatedMonthlyTransactions;
        this.accountNumber = accountNumber;
        this.accountBalance = accountBalance;
        this.accountType = accountType;
        this.maskedCardNumber = maskedCardNumber;
        this.cardStatus = cardStatus;
        this.isDisabled = isDisabled;  // ADDED this line
        this.isActive = ("APPROVED".equals(status) || "ACTIVE".equals(status)) && !isDisabled;
        this.isClosed = "CLOSED".equals(status);
        
        // Set application status based on main status
        if ("PENDING".equals(status)) {
            this.applicationStatus = "PENDING_REVIEW";
        } else if ("APPROVED".equals(status)) {
            this.applicationStatus = "APPROVED";
        } else if ("REJECTED".equals(status)) {
            this.applicationStatus = "REJECTED";
        }
    }

    private String maskEin(String ein) {
        if (ein == null || ein.length() < 4) return "***-**-****";
        return "***-**-" + ein.substring(ein.length() - 4);
    }

    private String buildFullAddress(String addr1, String addr2, String city, 
                                    String state, String zip, String country) {
        StringBuilder sb = new StringBuilder();
        sb.append(addr1);
        if (addr2 != null && !addr2.isEmpty()) {
            sb.append(", ").append(addr2);
        }
        sb.append(", ").append(city);
        sb.append(", ").append(state);
        sb.append(" ").append(zip);
        sb.append(", ").append(country);
        return sb.toString();
    }

    // ===== NEW: Helper methods to check application state =====
    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    public boolean hasAccount() {
        return accountId != null && accountNumber != null;
    }

    public boolean hasCards() {
        return maskedCardNumber != null;
    }

    // ===== NEW: Get account number with proper display =====
    public String getDisplayAccountNumber() {
        if (accountNumber == null) {
            return "Pending Approval";
        }
        return accountNumber; // Full number - masking handled in frontend
    }

    // ===== NEW: Get account balance with proper display =====
    public Double getDisplayBalance() {
        if (accountBalance == null) {
            return 0.0;
        }
        return accountBalance;
    }

    // ===== NEW: Getter and Setter for disabled field =====
    public boolean isDisabled() {
        return isDisabled;
    }

    public void setDisabled(boolean disabled) {
        isDisabled = disabled;
    }

    // Getters and Setters for new fields
    public String getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
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

    // Existing Getters and Setters
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

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getEin() {
        return ein;
    }

    public void setEin(String ein) {
        this.ein = ein;
        this.maskedEin = maskEin(ein);
    }

    public String getMaskedEin() {
        return maskedEin;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public Integer getYearsInOperation() {
        return yearsInOperation;
    }

    public void setYearsInOperation(Integer yearsInOperation) {
        this.yearsInOperation = yearsInOperation;
    }

    public Double getAnnualRevenue() {
        return annualRevenue;
    }

    public void setAnnualRevenue(Double annualRevenue) {
        this.annualRevenue = annualRevenue;
    }

    public Integer getNumberOfEmployees() {
        return numberOfEmployees;
    }

    public void setNumberOfEmployees(Integer numberOfEmployees) {
        this.numberOfEmployees = numberOfEmployees;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getBusinessAddress2() {
        return businessAddress2;
    }

    public void setBusinessAddress2(String businessAddress2) {
        this.businessAddress2 = businessAddress2;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getBusinessCity() {
        return businessCity;
    }

    public void setBusinessCity(String businessCity) {
        this.businessCity = businessCity;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getBusinessState() {
        return businessState;
    }

    public void setBusinessState(String businessState) {
        this.businessState = businessState;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getBusinessZipCode() {
        return businessZipCode;
    }

    public void setBusinessZipCode(String businessZipCode) {
        this.businessZipCode = businessZipCode;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getBusinessCountry() {
        return businessCountry;
    }

    public void setBusinessCountry(String businessCountry) {
        this.businessCountry = businessCountry;
        this.fullBusinessAddress = buildFullAddress(businessAddress, businessAddress2, businessCity, 
                                                    businessState, businessZipCode, businessCountry);
    }

    public String getFullBusinessAddress() {
        return fullBusinessAddress;
    }

    public String getBusinessPhone() {
        return businessPhone;
    }

    public void setBusinessPhone(String businessPhone) {
        this.businessPhone = businessPhone;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLegalStructure() {
        return legalStructure;
    }

    public void setLegalStructure(String legalStructure) {
        this.legalStructure = legalStructure;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.isActive = ("APPROVED".equals(status) || "ACTIVE".equals(status)) && !isDisabled;
        this.isClosed = "CLOSED".equals(status);
        
        // Update application status
        if ("PENDING".equals(status)) {
            this.applicationStatus = "PENDING_REVIEW";
        } else if ("APPROVED".equals(status)) {
            this.applicationStatus = "APPROVED";
        } else if ("REJECTED".equals(status)) {
            this.applicationStatus = "REJECTED";
        }
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getVerifiedDate() {
        return verifiedDate;
    }

    public void setVerifiedDate(LocalDateTime verifiedDate) {
        this.verifiedDate = verifiedDate;
    }

    public Double getEstimatedMonthlyVolume() {
        return estimatedMonthlyVolume;
    }

    public void setEstimatedMonthlyVolume(Double estimatedMonthlyVolume) {
        this.estimatedMonthlyVolume = estimatedMonthlyVolume;
    }

    public Integer getEstimatedMonthlyTransactions() {
        return estimatedMonthlyTransactions;
    }

    public void setEstimatedMonthlyTransactions(Integer estimatedMonthlyTransactions) {
        this.estimatedMonthlyTransactions = estimatedMonthlyTransactions;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getAccountBalance() {
        return accountBalance;
    }

    public void setAccountBalance(Double accountBalance) {
        this.accountBalance = accountBalance;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getCardStatus() {
        return cardStatus;
    }

    public void setCardStatus(String cardStatus) {
        this.cardStatus = cardStatus;
    }

    public boolean isActive() {
        return isActive;
    }

    public boolean isClosed() {
        return isClosed;
    }
}
package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class OpenBusinessAccountRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Business name is required")
    @Size(max = 200, message = "Business name must be less than 200 characters")
    private String businessName;

    @NotBlank(message = "EIN (Tax ID) is required")
    @Pattern(regexp = "^\\d{2}-\\d{7}$|^\\d{9}$", message = "EIN must be in format XX-XXXXXXX or 9 digits")
    private String ein;

    @NotBlank(message = "Business type is required")
    private String businessType; // LLC, CORPORATION, SOLE_PROPRIETORSHIP, PARTNERSHIP, NONPROFIT

    @NotBlank(message = "Industry is required")
    private String industry; // RETAIL, TECHNOLOGY, HEALTHCARE, CONSTRUCTION, etc.

    @NotNull(message = "Years in operation is required")
    @Positive(message = "Years in operation must be positive")
    private Integer yearsInOperation;

    @NotNull(message = "Annual revenue is required")
    @Positive(message = "Annual revenue must be positive")
    private Double annualRevenue;

    @NotNull(message = "Number of employees is required")
    @Positive(message = "Number of employees must be positive")
    private Integer numberOfEmployees;

    @NotBlank(message = "Business address is required")
    private String businessAddress;

    private String businessAddress2;

    @NotBlank(message = "Business city is required")
    private String businessCity;

    @NotBlank(message = "Business state is required")
    private String businessState;

    @NotBlank(message = "Business zip code is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid zip code format")
    private String businessZipCode;

    @NotBlank(message = "Business country is required")
    private String businessCountry;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String businessPhone;

    @Email(message = "Invalid email format")
    private String businessEmail;

    @Size(max = 100, message = "Website URL must be less than 100 characters")
    private String website;

    @NotBlank(message = "Legal structure is required")
    private String legalStructure;

    // Optional: JSON string of authorized signers
    private String authorizedSigners;

    // Optional: Estimated monthly transaction volume
    private Double estimatedMonthlyVolume;
    private Integer estimatedMonthlyTransactions;

    // Optional: Would you like a business debit card?
    private Boolean requestDebitCard = true;

    // Initial deposit amount (optional, defaults to 0)
    private Double initialDeposit = 0.0;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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
    }

    public String getBusinessAddress2() {
        return businessAddress2;
    }

    public void setBusinessAddress2(String businessAddress2) {
        this.businessAddress2 = businessAddress2;
    }

    public String getBusinessCity() {
        return businessCity;
    }

    public void setBusinessCity(String businessCity) {
        this.businessCity = businessCity;
    }

    public String getBusinessState() {
        return businessState;
    }

    public void setBusinessState(String businessState) {
        this.businessState = businessState;
    }

    public String getBusinessZipCode() {
        return businessZipCode;
    }

    public void setBusinessZipCode(String businessZipCode) {
        this.businessZipCode = businessZipCode;
    }

    public String getBusinessCountry() {
        return businessCountry;
    }

    public void setBusinessCountry(String businessCountry) {
        this.businessCountry = businessCountry;
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

    public String getAuthorizedSigners() {
        return authorizedSigners;
    }

    public void setAuthorizedSigners(String authorizedSigners) {
        this.authorizedSigners = authorizedSigners;
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

    public Boolean getRequestDebitCard() {
        return requestDebitCard;
    }

    public void setRequestDebitCard(Boolean requestDebitCard) {
        this.requestDebitCard = requestDebitCard;
    }

    public Double getInitialDeposit() {
        return initialDeposit;
    }

    public void setInitialDeposit(Double initialDeposit) {
        this.initialDeposit = initialDeposit;
    }

    // Helper method to validate EIN format
    public String getFormattedEin() {
        if (ein == null) return null;
        // Remove any existing dashes and format as XX-XXXXXXX
        String cleanEin = ein.replaceAll("[^0-9]", "");
        if (cleanEin.length() == 9) {
            return cleanEin.substring(0, 2) + "-" + cleanEin.substring(2);
        }
        return ein;
    }
}
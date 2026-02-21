package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;

public class RegistrationRequest {
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    
    // Contact Information
    private String phone;
    
    // Birth Information
    private LocalDate dateOfBirth;
    private String birthCity;
    private String birthState;
    private String birthCountry;
    
    // SSN (will be encrypted)
    private String ssn;
    
    // ⭐ NEW FINANCIAL INFORMATION FIELDS
    private String employmentStatus;
    private String annualIncome;      // Can be range string or custom amount
    private String sourceOfFunds;
    private String riskTolerance;     // Maps to investmentObjective from frontend
    private String taxBracket;
    
    // Constructors
    public RegistrationRequest() {}
    
    // Getters and Setters - Existing
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getBirthCity() {
        return birthCity;
    }
    
    public void setBirthCity(String birthCity) {
        this.birthCity = birthCity;
    }
    
    public String getBirthState() {
        return birthState;
    }
    
    public void setBirthState(String birthState) {
        this.birthState = birthState;
    }
    
    public String getBirthCountry() {
        return birthCountry;
    }
    
    public void setBirthCountry(String birthCountry) {
        this.birthCountry = birthCountry;
    }
    
    public String getSsn() {
        return ssn;
    }
    
    public void setSsn(String ssn) {
        this.ssn = ssn;
    }
    
    // ⭐ NEW GETTERS AND SETTERS - Financial Information
    public String getEmploymentStatus() {
        return employmentStatus;
    }
    
    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
    
    public String getAnnualIncome() {
        return annualIncome;
    }
    
    public void setAnnualIncome(String annualIncome) {
        this.annualIncome = annualIncome;
    }
    
    public String getSourceOfFunds() {
        return sourceOfFunds;
    }
    
    public void setSourceOfFunds(String sourceOfFunds) {
        this.sourceOfFunds = sourceOfFunds;
    }
    
    public String getRiskTolerance() {
        return riskTolerance;
    }
    
    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }
    
    public String getTaxBracket() {
        return taxBracket;
    }
    
    public void setTaxBracket(String taxBracket) {
        this.taxBracket = taxBracket;
    }
    
    // Helper method to validate password match
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
    
    // ⭐ Helper method to parse annual income to Double for storage
    public Double getAnnualIncomeAsDouble() {
        if (annualIncome == null || annualIncome.trim().isEmpty()) {
            return null;
        }
        
        // If it's already a numeric string (custom amount)
        try {
            // Remove commas and any non-numeric characters except decimal point
            String cleanValue = annualIncome.replaceAll("[^\\d.]", "");
            if (!cleanValue.isEmpty()) {
                return Double.parseDouble(cleanValue);
            }
        } catch (NumberFormatException e) {
            // If parsing fails, it's probably a range string - store as null or you could store the range
            return null;
        }
        
        return null;
    }
}
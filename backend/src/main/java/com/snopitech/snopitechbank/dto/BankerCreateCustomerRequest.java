package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;

public class BankerCreateCustomerRequest {
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String ssn;
    
    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Birth Information
    private String birthCity;
    private String birthState;
    private String birthCountry;
    
    // Financial Information
    private String employmentStatus;
    private String annualIncome;
    private String sourceOfFunds;
    private String riskTolerance;
    private String taxBracket;
    
    // Security Questions
    private String securityQuestion1;
    private String securityAnswer1;
    private String securityQuestion2;
    private String securityAnswer2;
    private String securityQuestion3;
    private String securityAnswer3;
    
    // Password
    private String password;
    
    // Employee who is creating this customer
    private Long employeeId;
    
    // Constructors
    public BankerCreateCustomerRequest() {}
    
    // Getters and Setters
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
    
    public String getSsn() {
        return ssn;
    }
    
    public void setSsn(String ssn) {
        this.ssn = ssn;
    }
    
    public String getAddressLine1() {
        return addressLine1;
    }
    
    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }
    
    public String getAddressLine2() {
        return addressLine2;
    }
    
    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
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
    
    public String getSecurityQuestion1() {
        return securityQuestion1;
    }
    
    public void setSecurityQuestion1(String securityQuestion1) {
        this.securityQuestion1 = securityQuestion1;
    }
    
    public String getSecurityAnswer1() {
        return securityAnswer1;
    }
    
    public void setSecurityAnswer1(String securityAnswer1) {
        this.securityAnswer1 = securityAnswer1;
    }
    
    public String getSecurityQuestion2() {
        return securityQuestion2;
    }
    
    public void setSecurityQuestion2(String securityQuestion2) {
        this.securityQuestion2 = securityQuestion2;
    }
    
    public String getSecurityAnswer2() {
        return securityAnswer2;
    }
    
    public void setSecurityAnswer2(String securityAnswer2) {
        this.securityAnswer2 = securityAnswer2;
    }
    
    public String getSecurityQuestion3() {
        return securityQuestion3;
    }
    
    public void setSecurityQuestion3(String securityQuestion3) {
        this.securityQuestion3 = securityQuestion3;
    }
    
    public String getSecurityAnswer3() {
        return securityAnswer3;
    }
    
    public void setSecurityAnswer3(String securityAnswer3) {
        this.securityAnswer3 = securityAnswer3;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    // Helper method to convert annual income to Double
    public Double getAnnualIncomeAsDouble() {
        if (annualIncome == null || annualIncome.trim().isEmpty()) {
            return null;
        }
        
        if (annualIncome.contains("Under $25,000")) return 12500.0;
        if (annualIncome.contains("$25,000 - $49,999")) return 37500.0;
        if (annualIncome.contains("$50,000 - $74,999")) return 62500.0;
        if (annualIncome.contains("$75,000 - $99,999")) return 87500.0;
        if (annualIncome.contains("$100,000 - $149,999")) return 125000.0;
        if (annualIncome.contains("$150,000 - $199,999")) return 175000.0;
        if (annualIncome.contains("$200,000 - $299,999")) return 250000.0;
        if (annualIncome.contains("$300,000+")) return 300000.0;
        
        try {
            String cleanValue = annualIncome.replaceAll("[^\\d.]", "");
            if (!cleanValue.isEmpty()) {
                return Double.parseDouble(cleanValue);
            }
        } catch (NumberFormatException e) {
            return null;
        }
        
        return null;
    }
}
package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;

public class ProfileResponse {
    
    // Personal Information
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String customerId;
    private String phone;
    private LocalDate dateOfBirth;
    
    // Birth Information
    private String birthCity;
    private String birthState;
    private String birthCountry;
    
    // Address Information
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private boolean hasAddress;
    
    // Security Information
    private String ssnMasked;
    private String securityQuestions;
    
    // Account Information
    private String memberSince;
    private int age;
    private boolean profileComplete;
    private int accountCount;
    
    // Constructors
    public ProfileResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getBirthCity() { return birthCity; }
    public void setBirthCity(String birthCity) { this.birthCity = birthCity; }
    
    public String getBirthState() { return birthState; }
    public void setBirthState(String birthState) { this.birthState = birthState; }
    
    public String getBirthCountry() { return birthCountry; }
    public void setBirthCountry(String birthCountry) { this.birthCountry = birthCountry; }
    
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public boolean isHasAddress() { return hasAddress; }
    public void setHasAddress(boolean hasAddress) { this.hasAddress = hasAddress; }
    
    public String getSsnMasked() { return ssnMasked; }
    public void setSsnMasked(String ssnMasked) { this.ssnMasked = ssnMasked; }
    
    public String getSecurityQuestions() { return securityQuestions; }
    public void setSecurityQuestions(String securityQuestions) { this.securityQuestions = securityQuestions; }
    
    public String getMemberSince() { return memberSince; }
    public void setMemberSince(String memberSince) { this.memberSince = memberSince; }
    
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    
    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }
    
    public int getAccountCount() { return accountCount; }
    public void setAccountCount(int accountCount) { this.accountCount = accountCount; }
}
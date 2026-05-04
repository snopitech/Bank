package com.snopitech.snopitechbank.dto;

import java.util.List;

public class CustomerSearchResponse {

    private Long customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String maskedSsn;
    private String phone;
    private List<String> existingAccounts;
    private List<String> availableAccountTypes;

    // Constructors
    public CustomerSearchResponse() {}

    // Getters and Setters
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMaskedSsn() { return maskedSsn; }
    public void setMaskedSsn(String maskedSsn) { this.maskedSsn = maskedSsn; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public List<String> getExistingAccounts() { return existingAccounts; }
    public void setExistingAccounts(List<String> existingAccounts) { this.existingAccounts = existingAccounts; }
    public List<String> getAvailableAccountTypes() { return availableAccountTypes; }
    public void setAvailableAccountTypes(List<String> availableAccountTypes) { this.availableAccountTypes = availableAccountTypes; }
}
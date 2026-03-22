package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Map;

public class CreateEmployeeRequest {

    // Personal Information
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must be less than 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be less than 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@snopitech\\.com$", 
             message = "Email must be @snopitech.com domain")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    private LocalDate dateOfBirth;

    @Size(max = 11, message = "SSN must be 11 characters (XXX-XX-XXXX)")
    @Pattern(regexp = "^(\\d{3}-\\d{2}-\\d{4})?$", message = "SSN must be in format XXX-XX-XXXX")
    private String ssn;

    // Employment Details
    @NotBlank(message = "Employee ID is required")
    @Size(max = 20, message = "Employee ID must be less than 20 characters")
    private String employeeId;

    @Size(max = 50, message = "Department must be less than 50 characters")
    private String department;

    private LocalDate hireDate;

    @Pattern(regexp = "full-time|part-time|contract|intern", 
             message = "Employment type must be full-time, part-time, contract, or intern")
    private String employmentType;

    @Size(max = 100, message = "Reports to must be less than 100 characters")
    private String reportsTo;

    // Role & Permissions
    @Size(max = 100, message = "Role must be less than 100 characters")
    private String role;

    private Map<String, Boolean> permissions;

    // Work Contact
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid work phone format")
    private String workPhone;

    private String workEmail;

    @Size(max = 100, message = "Office location must be less than 100 characters")
    private String officeLocation;

    // Address
    @Size(max = 100, message = "Address line 1 must be less than 100 characters")
    private String addressLine1;

    @Size(max = 100, message = "Address line 2 must be less than 100 characters")
    private String addressLine2;

    @Size(max = 50, message = "City must be less than 50 characters")
    private String city;

    @Size(max = 20, message = "State must be less than 20 characters")
    private String state;

    @Size(max = 10, message = "ZIP code must be less than 10 characters")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
    private String zipCode;

    @Size(max = 50, message = "Country must be less than 50 characters")
    private String country;

    // Emergency Contact
    @Size(max = 100, message = "Emergency contact name must be less than 100 characters")
    private String emergencyName;

    @Size(max = 50, message = "Emergency relationship must be less than 50 characters")
    private String emergencyRelationship;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid emergency phone format")
    private String emergencyPhone;

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

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getReportsTo() {
        return reportsTo;
    }

    public void setReportsTo(String reportsTo) {
        this.reportsTo = reportsTo;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public void setPermissions(Map<String, Boolean> permissions) {
        this.permissions = permissions;
    }

    public String getWorkPhone() {
        return workPhone;
    }

    public void setWorkPhone(String workPhone) {
        this.workPhone = workPhone;
    }

    public String getWorkEmail() {
        return workEmail;
    }

    public void setWorkEmail(String workEmail) {
        this.workEmail = workEmail;
    }

    public String getOfficeLocation() {
        return officeLocation;
    }

    public void setOfficeLocation(String officeLocation) {
        this.officeLocation = officeLocation;
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

    public String getEmergencyName() {
        return emergencyName;
    }

    public void setEmergencyName(String emergencyName) {
        this.emergencyName = emergencyName;
    }

    public String getEmergencyRelationship() {
        return emergencyRelationship;
    }

    public void setEmergencyRelationship(String emergencyRelationship) {
        this.emergencyRelationship = emergencyRelationship;
    }

    public String getEmergencyPhone() {
        return emergencyPhone;
    }

    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }
}
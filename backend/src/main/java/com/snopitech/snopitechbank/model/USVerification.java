package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "us_verifications")
public class USVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ⭐ USER INFORMATION
    @Column(nullable = false)
    private Long userId;  // Will be null initially, set after approval
    
    // ⭐ SSN INFORMATION
    @Column(nullable = false, length = 255)
    private String ssnEncrypted;  // Encrypted SSN
    
    @Column(nullable = false, length = 4)
    private String ssnLastFour;  // Last 4 digits for display
    
    // ⭐ USER DATA FROM REGISTRATION
    @Column(length = 100, nullable = false)
    private String email;

    @Column(length = 50, nullable = false)
    private String firstName;

    @Column(length = 50, nullable = false)
    private String lastName;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(length = 100)
    private String birthCity;

    @Column(length = 50)
    private String birthState;

    @Column(length = 50)
    private String birthCountry;

    @Column(length = 255, nullable = false)
    private String password;
    
    // ⭐ ADDRESS FIELDS
    @Column(length = 255)
    private String addressLine1;

    @Column(length = 255)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(length = 20)
    private String zipCode;

    @Column(length = 100)
    private String country;
    
    // ⭐ FINANCIAL FIELDS
    @Column(length = 50)
    private String employmentStatus;

    private Double annualIncome;

    @Column(length = 100)
    private String sourceOfFunds;

    @Column(length = 50)
    private String riskTolerance;

    @Column(length = 50)
    private String taxBracket;
    
    // ⭐ SECURITY QUESTIONS
    @Column(columnDefinition = "TEXT")
    private String securityQuestions;
    
    // ⭐ STATUS INFORMATION
    @Column(nullable = false, length = 20)
    private String status;  // PENDING_REVIEW, APPROVED, REJECTED
    
    @Column(columnDefinition = "TEXT")
    private String adminNotes;  // Notes from admin review
    
    @Column(length = 100)
    private String reviewedBy;  // Admin who reviewed
    
    // ⭐ TIMESTAMPS
    @Column(nullable = false)
    private LocalDateTime submittedAt;  // When user submitted
    
    private LocalDateTime reviewedAt;   // When admin reviewed
    
    // ⭐ CONSTRUCTORS
    public USVerification() {
        this.submittedAt = LocalDateTime.now();
        this.status = "PENDING_REVIEW";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getSsnEncrypted() {
        return ssnEncrypted;
    }
    
    public void setSsnEncrypted(String ssnEncrypted) {
        this.ssnEncrypted = ssnEncrypted;
    }
    
    public String getSsnLastFour() {
        return ssnLastFour;
    }
    
    public void setSsnLastFour(String ssnLastFour) {
        this.ssnLastFour = ssnLastFour;
    }
    
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
    
    public String getSecurityQuestions() {
        return securityQuestions;
    }

    public void setSecurityQuestions(String securityQuestions) {
        this.securityQuestions = securityQuestions;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getAdminNotes() {
        return adminNotes;
    }
    
    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
    
    public String getReviewedBy() {
        return reviewedBy;
    }
    
    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    // ⭐ CONVENIENCE METHODS
    
    public boolean isPending() {
        return "PENDING_REVIEW".equals(status);
    }
    
    public boolean isApproved() {
        return "APPROVED".equals(status);
    }
    
    public boolean isRejected() {
        return "REJECTED".equals(status);
    }
    
    public void approve(String adminUsername) {
        this.status = "APPROVED";
        this.reviewedBy = adminUsername;
        this.reviewedAt = LocalDateTime.now();
    }
    
    public void reject(String adminUsername, String notes) {
        this.status = "REJECTED";
        this.reviewedBy = adminUsername;
        this.adminNotes = notes;
        this.reviewedAt = LocalDateTime.now();
    }
    
    public String getSsnMasked() {
        if (ssnLastFour == null || ssnLastFour.length() != 4) {
            return "***-**-****";
        }
        return "***-**-" + ssnLastFour;
    }
    
    public long getPendingDuration() {
        if (reviewedAt == null) {
            return java.time.Duration.between(submittedAt, LocalDateTime.now()).toHours();
        }
        return java.time.Duration.between(submittedAt, reviewedAt).toHours();
    }
}
package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_verifications")
public class PendingVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ⭐ USER INFORMATION
    @Column(nullable = false)
    private Long userId;  // References User.id
    
    // ⭐ DOCUMENT INFORMATION
    @Column(nullable = false, length = 20)
    private String documentType;  // PASSPORT, NATIONAL_ID, DRIVERS_LICENSE
    
    @Column(nullable = false, length = 500)
    private String documentPath;  // Path where file is stored
    
    // ⭐ DOCUMENT STORAGE (BLOB)
    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] documentData;  // Actual file content
    
    @Column(length = 255)
    private String documentFileName;  // Original filename
    
    @Column(length = 100)
    private String documentContentType;  // MIME type (image/jpeg, application/pdf, etc.)
    
    @Column(length = 50)
    private String documentNumber;  // Optional document number
    
    @Column(length = 50)
    private String issuingCountry;  // Country that issued the document
    
    private LocalDate expiryDate;  // Document expiry date
    
    // ⭐ TRULIOO INFORMATION
    @Column(length = 100)
    private String transactionId;  // Trulioo transaction ID
    
    @Column(columnDefinition = "TEXT")
    private String truliooResponse;  // Full Trulioo response as JSON
    
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
    
    // ⭐ NEW FIELDS - USER DATA FROM REGISTRATION
    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String firstName;

    @Column(length = 50)
    private String lastName;

    @Column(length = 20)
    private String phone;

    private LocalDate dateOfBirth;

    @Column(length = 100)
    private String birthCity;

    @Column(length = 50)
    private String birthState;

    @Column(length = 50)
    private String birthCountry;

    @Column(length = 255)
    private String password;
    
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
    
    // ⭐ ADDRESS FIELDS (NEW)
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

    // ⭐ SECURITY QUESTIONS (NEW)
    @Column(columnDefinition = "TEXT")
    private String securityQuestions;
    
    // ⭐ CONSTRUCTORS
    public PendingVerification() {
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
    
    public String getDocumentType() {
        return documentType;
    }
    
    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }
    
    public String getDocumentPath() {
        return documentPath;
    }
    
    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }
    
    // ⭐ BLOB GETTERS AND SETTERS
    public byte[] getDocumentData() {
        return documentData;
    }
    
    public void setDocumentData(byte[] documentData) {
        this.documentData = documentData;
    }
    
    public String getDocumentFileName() {
        return documentFileName;
    }
    
    public void setDocumentFileName(String documentFileName) {
        this.documentFileName = documentFileName;
    }
    
    public String getDocumentContentType() {
        return documentContentType;
    }
    
    public void setDocumentContentType(String documentContentType) {
        this.documentContentType = documentContentType;
    }
    
    public String getDocumentNumber() {
        return documentNumber;
    }
    
    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }
    
    public String getIssuingCountry() {
        return issuingCountry;
    }
    
    public void setIssuingCountry(String issuingCountry) {
        this.issuingCountry = issuingCountry;
    }
    
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getTruliooResponse() {
        return truliooResponse;
    }
    
    public void setTruliooResponse(String truliooResponse) {
        this.truliooResponse = truliooResponse;
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
    
    // ⭐ USER DATA GETTERS AND SETTERS
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
    
    // ⭐ FINANCIAL GETTERS AND SETTERS
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
    
    // ⭐ ADDRESS GETTERS AND SETTERS (NEW)
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

    // ⭐ SECURITY QUESTIONS GETTERS AND SETTERS (NEW)
    public String getSecurityQuestions() {
        return securityQuestions;
    }

    public void setSecurityQuestions(String securityQuestions) {
        this.securityQuestions = securityQuestions;
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
    
    // ⭐ HELPER METHOD for file info
    public String getFileSizeAsString() {
        if (documentData == null) return "0 bytes";
        long size = documentData.length;
        if (size < 1024) return size + " bytes";
        if (size < 1024 * 1024) return String.format("%.2f KB", size / 1024.0);
        return String.format("%.2f MB", size / (1024.0 * 1024.0));
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
    
    public long getPendingDuration() {
        if (reviewedAt == null) {
            return java.time.Duration.between(submittedAt, LocalDateTime.now()).toHours();
        }
        return java.time.Duration.between(submittedAt, reviewedAt).toHours();
    }
}
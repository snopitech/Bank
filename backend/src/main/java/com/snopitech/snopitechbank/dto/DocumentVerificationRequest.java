package com.snopitech.snopitechbank.dto;

import java.time.LocalDate;
import org.springframework.web.multipart.MultipartFile;

public class DocumentVerificationRequest {
    
    // User identifier
    private String userId;
    
    // Document information
    private String documentType;  // "PASSPORT", "NATIONAL_ID", "DRIVERS_LICENSE"
    private MultipartFile document;
    
    // Optional document details
    private String documentNumber;
    private String issuingCountry;
    private LocalDate expiryDate;
    
    // Transaction tracking
    private String transactionId;
    
    // Constructors
    public DocumentVerificationRequest() {}
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getDocumentType() {
        return documentType;
    }
    
    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }
    
    public MultipartFile getDocument() {
        return document;
    }
    
    public void setDocument(MultipartFile document) {
        this.document = document;
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
    
    // Helper methods
    public boolean hasDocument() {
        return document != null && !document.isEmpty();
    }
    
    public String getFileSizeInMB() {
        if (document == null) return "0";
        long sizeInBytes = document.getSize();
        double sizeInMB = sizeInBytes / (1024.0 * 1024.0);
        return String.format("%.2f", sizeInMB);
    }
    
    public boolean isValidDocumentType() {
        if (documentType == null) return false;
        return documentType.equals("PASSPORT") || 
               documentType.equals("NATIONAL_ID") || 
               documentType.equals("DRIVERS_LICENSE");
    }
}
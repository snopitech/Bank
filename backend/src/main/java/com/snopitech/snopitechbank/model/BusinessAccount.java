package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "business_accounts")
public class BusinessAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
     
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Primary owner
    
    // ===== CHANGED: Make account nullable (not created until approval) =====
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "account_id", nullable = true)
    private Account account; // Linked to main account for transactions (created upon approval)

    // ===== CHANGED: Cards are nullable (not created until approval) =====
    @OneToMany(mappedBy = "businessAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Card> cards = new ArrayList<>();

    // Keep track of which card is the primary one
    private Long primaryCardId;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false, unique = true)
    private String ein; // Employer Identification Number (Tax ID)

    @Column(nullable = false)
    private String businessType; // LLC, CORPORATION, SOLE_PROPRIETORSHIP, PARTNERSHIP, NONPROFIT

    @Column(nullable = false)
    private String industry; // RETAIL, TECHNOLOGY, HEALTHCARE, CONSTRUCTION, etc.

    @Column(nullable = false)
    private Integer yearsInOperation;

    @Column(nullable = false)
    private Double annualRevenue;

    @Column(nullable = false)
    private Integer numberOfEmployees;

    @Column(nullable = false)
    private String businessAddress;

    private String businessAddress2;
    
    @Column(nullable = false)
    private String businessCity;
    
    @Column(nullable = false)
    private String businessState;
    
    @Column(nullable = false)
    private String businessZipCode;
    
    @Column(nullable = false)
    private String businessCountry;

    private String businessPhone;
    private String businessEmail;
    private String website;

    @Column(nullable = false)
    private String legalStructure; // The legal structure of the business

    // Authorized signers (JSON format for multiple signers)
    @Column(columnDefinition = "TEXT")
    private String authorizedSigners;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, ACTIVE, SUSPENDED, CLOSED

    private LocalDateTime closedDate;
    private String closureReason;

    // Business verification status
    @Column(nullable = false)
    private Boolean verified = false;
    
    private LocalDateTime verifiedDate;
    private String verifiedBy;

    // Monthly transaction volume estimates
    private Double estimatedMonthlyVolume;
    private Integer estimatedMonthlyTransactions;

    // Business documents (JSON array of document references)
    @Column(columnDefinition = "TEXT")
    private String businessDocuments;

    // ===== NEW: Application tracking fields =====
    private String applicationStatus; // PENDING_REVIEW, UNDER_REVIEW, etc.
    private LocalDateTime submittedDate;
    private LocalDateTime reviewedDate;
    private String reviewedBy;
    private String rejectionReason;

    // Constructors
    public BusinessAccount() {
        this.createdDate = LocalDateTime.now();
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING"; // Changed from ACTIVE to PENDING
        this.applicationStatus = "PENDING_REVIEW";
        this.verified = false;
        this.cards = new ArrayList<>();
    }

    // Constructor for application (no account or cards yet)
    public BusinessAccount(User user, String businessName, String ein, 
                          String businessType, String industry, String businessAddress) {
        this.user = user;
        this.businessName = businessName;
        this.ein = ein;
        this.businessType = businessType;
        this.industry = industry;
        this.businessAddress = businessAddress;
        this.createdDate = LocalDateTime.now();
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
        this.applicationStatus = "PENDING_REVIEW";
        this.verified = false;
        this.cards = new ArrayList<>();
        this.account = null; // No account until approval
    }

    // Constructor for backward compatibility (kept for existing code)
    @Deprecated
    public BusinessAccount(User user, Account account, String businessName, String ein, 
                          String businessType, String industry, String businessAddress) {
        this.user = user;
        this.account = account;
        this.businessName = businessName;
        this.ein = ein;
        this.businessType = businessType;
        this.industry = industry;
        this.businessAddress = businessAddress;
        this.createdDate = LocalDateTime.now();
        this.submittedDate = LocalDateTime.now();
        this.status = "PENDING";
        this.applicationStatus = "PENDING_REVIEW";
        this.verified = false;
        this.cards = new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    // ===== Card list getters and setters =====
    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }

    public Long getPrimaryCardId() {
        return primaryCardId;
    }

    public void setPrimaryCardId(Long primaryCardId) {
        this.primaryCardId = primaryCardId;
    }

    // ===== Application tracking getters/setters =====
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

    // ===== HELPER METHODS FOR CARDS =====

    /**
     * Get the primary card (physical debit card)
     */
    public Card getPrimaryCard() {
        if (primaryCardId == null || cards == null || cards.isEmpty()) {
            return null;
        }
        return cards.stream()
            .filter(card -> card.getId().equals(primaryCardId))
            .findFirst()
            .orElse(null);
    }

    /**
     * Get all virtual cards
     */
    public List<Card> getVirtualCards() {
        if (cards == null || cards.isEmpty()) {
            return new ArrayList<>();
        }
        return cards.stream()
            .filter(card -> "VIRTUAL".equals(card.getCardType()))
            .collect(Collectors.toList());
    }

    /**
     * Get all physical cards
     */
    public List<Card> getPhysicalCards() {
        if (cards == null || cards.isEmpty()) {
            return new ArrayList<>();
        }
        return cards.stream()
            .filter(card -> "PHYSICAL".equals(card.getCardType()))
            .collect(Collectors.toList());
    }

    /**
     * Get active cards only
     */
    public List<Card> getActiveCards() {
        if (cards == null || cards.isEmpty()) {
            return new ArrayList<>();
        }
        return cards.stream()
            .filter(Card::isActive)
            .collect(Collectors.toList());
    }

    /**
     * Add a card to this business account
     */
    public void addCard(Card card) {
        if (cards == null) {
            cards = new ArrayList<>();
        }
        cards.add(card);
        card.setBusinessAccount(this);
        
        // If this is the first card, make it primary
        if (cards.size() == 1 && primaryCardId == null) {
            this.primaryCardId = card.getId();
        }
    }

    /**
     * Remove a card from this business account
     */
    public void removeCard(Card card) {
        if (cards != null) {
            cards.remove(card);
            card.setBusinessAccount(null);
            
            // If we removed the primary card, set a new primary if available
            if (card.getId().equals(primaryCardId) && !cards.isEmpty()) {
                this.primaryCardId = cards.get(0).getId();
            } else if (cards.isEmpty()) {
                this.primaryCardId = null;
            }
        }
    }

    // Rest of the existing getters and setters...
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
    }

    public LocalDateTime getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(LocalDateTime closedDate) {
        this.closedDate = closedDate;
    }

    public String getClosureReason() {
        return closureReason;
    }

    public void setClosureReason(String closureReason) {
        this.closureReason = closureReason;
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

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
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

    public String getBusinessDocuments() {
        return businessDocuments;
    }

    public void setBusinessDocuments(String businessDocuments) {
        this.businessDocuments = businessDocuments;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }

    // Helper methods
    public String getMaskedEin() {
        if (ein == null || ein.length() < 4) return "***-**-****";
        return "***-**-" + ein.substring(ein.length() - 4);
    }

    public String getFullBusinessAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(businessAddress);
        if (businessAddress2 != null && !businessAddress2.isEmpty()) {
            sb.append(", ").append(businessAddress2);
        }
        sb.append(", ").append(businessCity);
        sb.append(", ").append(businessState);
        sb.append(" ").append(businessZipCode);
        sb.append(", ").append(businessCountry);
        return sb.toString();
    }

    public boolean isActive() {
        return "ACTIVE".equals(status) || "APPROVED".equals(status);
    }

    public boolean isClosed() {
        return "CLOSED".equals(status);
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    /**
     * Get the account number (full visibility - no masking here, masking is done in frontend)
     */
    public String getAccountNumber() {
        if (account == null || account.getAccountNumber() == null) {
            return "Pending Approval";
        }
        return account.getAccountNumber(); // Full account number - frontend handles masking
    }

    /**
     * Get the account balance
     */
    public Double getAccountBalance() {
        if (account == null) {
            return 0.0;
        }
        return account.getBalance();
    }
}
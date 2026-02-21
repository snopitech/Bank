package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false)
    private String claimNumber;

    @Column(nullable = false)
    private String claimType;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String description;

    private Double disputedAmount;

    private LocalDateTime transactionDate;

    private String transactionId;

    private String merchantName;

    @Column(length = 1000)
    private String resolution;

    private LocalDateTime filedDate;

    private LocalDateTime lastUpdatedDate;

    private LocalDateTime resolvedDate;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClaimDocument> documents = new ArrayList<>();

    // Constructors
    public Claim() {
        this.filedDate = LocalDateTime.now();
        this.lastUpdatedDate = LocalDateTime.now();
        this.status = "SUBMITTED";
    }

    // Getters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Account getAccount() {
        return account;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public String getClaimType() {
        return claimType;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public String getSubject() {
        return subject;
    }

    public String getDescription() {
        return description;
    }

    public Double getDisputedAmount() {
        return disputedAmount;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public String getResolution() {
        return resolution;
    }

    public LocalDateTime getFiledDate() {
        return filedDate;
    }

    public LocalDateTime getLastUpdatedDate() {
        return lastUpdatedDate;
    }

    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }

    public List<ClaimDocument> getDocuments() {
        return documents;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public void setClaimType(String claimType) {
        this.claimType = claimType;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDisputedAmount(Double disputedAmount) {
        this.disputedAmount = disputedAmount;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public void setFiledDate(LocalDateTime filedDate) {
        this.filedDate = filedDate;
    }

    public void setLastUpdatedDate(LocalDateTime lastUpdatedDate) {
        this.lastUpdatedDate = lastUpdatedDate;
    }

    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public void setDocuments(List<ClaimDocument> documents) {
        this.documents = documents;
    }
}
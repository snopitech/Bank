package com.snopitech.snopitechbank.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", unique = true, nullable = false, length = 20)
    private String referenceNumber; // Format: INQ-YYYY-XXXX

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_inquiry_user"))
    private User user;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 50)
    private String category; // Will use enums later

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL";

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @Column(name = "responded_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime respondedAt;

    @Column(name = "resolved_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime resolvedAt;

    @Column(name = "auto_response_sent")
    private boolean autoResponseSent = false;

    @Column(name = "admin_notification_sent")
    private boolean adminNotificationSent = false;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    // Default constructor
    public Inquiry() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor for creating new inquiry
    public Inquiry(String referenceNumber, String fullName, String email, 
                   String category, String subject, String message) {
        this();
        this.referenceNumber = referenceNumber;
        this.fullName = fullName;
        this.email = email;
        this.category = category;
        this.subject = subject;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { 
        this.user = user;
        this.updatedAt = LocalDateTime.now();
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { 
        this.fullName = fullName;
        this.updatedAt = LocalDateTime.now();
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { 
        this.email = email;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { 
        this.phone = phone;
        this.updatedAt = LocalDateTime.now();
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { 
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { 
        this.subject = subject;
        this.updatedAt = LocalDateTime.now();
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { 
        this.message = message;
        this.updatedAt = LocalDateTime.now();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if ("RESOLVED".equals(status) && this.resolvedAt == null) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { 
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { 
        this.accountNumber = accountNumber;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { 
        this.respondedAt = respondedAt;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { 
        this.resolvedAt = resolvedAt;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAutoResponseSent() { return autoResponseSent; }
    public void setAutoResponseSent(boolean autoResponseSent) { 
        this.autoResponseSent = autoResponseSent;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAdminNotificationSent() { return adminNotificationSent; }
    public void setAdminNotificationSent(boolean adminNotificationSent) { 
        this.adminNotificationSent = adminNotificationSent;
        this.updatedAt = LocalDateTime.now();
    }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    // Helper method to check if inquiry is open
    @JsonIgnore
    public boolean isOpen() {
        return "OPEN".equals(this.status) || "IN_PROGRESS".equals(this.status);
    }

    // Helper method to check if inquiry is urgent
    @JsonIgnore
    public boolean isUrgent() {
        return "URGENT".equals(this.priority) || "HIGH".equals(this.priority);
    }

    // Update timestamp manually
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}

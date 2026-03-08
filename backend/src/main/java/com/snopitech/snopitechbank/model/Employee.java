package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Information
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // TOTP Fields (using Boolean objects to allow null values from database)
    @Column(name = "totp_secret")
    private String totpSecret;

    @Column(name = "totp_enabled")
    private Boolean totpEnabled = false;

    @Column(name = "totp_setup_completed")
    private Boolean totpSetupCompleted = false;

    @Column(name = "login_count")
    private Integer loginCount = 0;

    @Column(name = "totp_enforcement_date")
    private LocalDateTime totpEnforcementDate;

     @Column(name = "hr_failed_attempts")
     private Integer hrFailedAttempts = 0;

     @Column(name = "hr_account_locked")
     private Boolean hrAccountLocked = false;

     @Column(name = "hr_lock_expiry")
     private LocalDateTime hrLockExpiry;

    @Column(nullable = false, unique = true)
    private String email; // Company email (e.g., john.doe@snopitech.com)

    private String phone;

    private LocalDate dateOfBirth;

    private String ssn; // Encrypted

    // Employment Details
    @Column(nullable = false, unique = true)
    private String employeeId;

    private String department;

    private LocalDate hireDate;

    private String employmentType; // full-time, part-time, contract, intern

    private String reportsTo;

    // Role & Permissions
    private String role; // Job title

    @Column(columnDefinition = "TEXT")
    private String permissions; // JSON string of permissions

    // Work Contact
    private String workPhone;

    private String workEmail;

    private String officeLocation;

    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // Emergency Contact
    private String emergencyName;
    private String emergencyRelationship;
    private String emergencyPhone;

    // System Fields
    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, INACTIVE

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime approvedAt;

    private String approvedBy; // Admin who approved

    private String rejectionReason;

    // Login credentials (only set after approval)
    private String passwordHash; // BCrypted password

    private Boolean passwordChangeRequired = true;

    private LocalDateTime lastLoginAt;

    private Boolean isActive = true;

    // Approval token (for email approval link)
    private String approvalToken;

    private LocalDateTime approvalTokenExpiry;

    // Constructors
    public Employee() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public Employee(String firstName, String lastName, String email, String employeeId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.employeeId = employeeId;
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPermissions() {
        return permissions;
    }

    public void setPermissions(String permissions) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Boolean getPasswordChangeRequired() {
        return passwordChangeRequired;
    }

    public void setPasswordChangeRequired(Boolean passwordChangeRequired) {
        this.passwordChangeRequired = passwordChangeRequired;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getApprovalToken() {
        return approvalToken;
    }

    public void setApprovalToken(String approvalToken) {
        this.approvalToken = approvalToken;
    }

    public LocalDateTime getApprovalTokenExpiry() {
        return approvalTokenExpiry;
    }

    public void setApprovalTokenExpiry(LocalDateTime approvalTokenExpiry) {
        this.approvalTokenExpiry = approvalTokenExpiry;
    }

    // ===== TOTP GETTERS AND SETTERS (UPDATED) =====
    public String getTotpSecret() {
        return totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    public Boolean getTotpEnabled() {
        return totpEnabled;
    }

    public void setTotpEnabled(Boolean totpEnabled) {
        this.totpEnabled = totpEnabled;
    }

    public Boolean getTotpSetupCompleted() {
        return totpSetupCompleted;
    }

    public void setTotpSetupCompleted(Boolean totpSetupCompleted) {
        this.totpSetupCompleted = totpSetupCompleted;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getMaskedSsn() {
        if (ssn == null || ssn.length() < 4) return "***-**-****";
        return "***-**-" + ssn.substring(ssn.length() - 4);
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }
    public Integer getLoginCount() {
    return loginCount;
    }  
    public Integer getHrFailedAttempts() {
    return hrFailedAttempts;
}

public void setHrFailedAttempts(Integer hrFailedAttempts) {
    this.hrFailedAttempts = hrFailedAttempts;
}

public Boolean getHrAccountLocked() {
    return hrAccountLocked;
}

public void setHrAccountLocked(Boolean hrAccountLocked) {
    this.hrAccountLocked = hrAccountLocked;
}

public LocalDateTime getHrLockExpiry() {
    return hrLockExpiry;
}

public void setHrLockExpiry(LocalDateTime hrLockExpiry) {
    this.hrLockExpiry = hrLockExpiry;
}  

// Add these methods to check lock status
public boolean isHrLocked() {
    if (hrAccountLocked == null || !hrAccountLocked) return false;
    if (hrLockExpiry != null && hrLockExpiry.isBefore(LocalDateTime.now())) {
        // Lock expired, auto-unlock
        this.hrAccountLocked = false;
        this.hrLockExpiry = null;
        return false;
    }
    return true;
}

public void incrementHrFailedAttempts() {
    if (this.hrFailedAttempts == null) {
        this.hrFailedAttempts = 1;
    } else {
        this.hrFailedAttempts++;
    }
}

public void resetHrFailedAttempts() {
    this.hrFailedAttempts = 0;
    this.hrAccountLocked = false;
    this.hrLockExpiry = null;
}

public void lockHrAccount() {
    this.hrAccountLocked = true;
    this.hrLockExpiry = LocalDateTime.now().plusMinutes(30);
}

public void setLoginCount(Integer loginCount) {
    this.loginCount = loginCount;
}

public LocalDateTime getTotpEnforcementDate() {
    return totpEnforcementDate;
}

public void setTotpEnforcementDate(LocalDateTime totpEnforcementDate) {
    this.totpEnforcementDate = totpEnforcementDate;
}
    
}
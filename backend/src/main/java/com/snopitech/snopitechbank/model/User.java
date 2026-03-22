package com.snopitech.snopitechbank.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ EXISTING PERSONAL FIELDS
    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    // ⭐ EXISTING CONTACT FIELDS
    private String phone;
    private String addressLine1;
    private String addressLine2; // optional
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // ⭐ NEW BANKING FIELDS
    
    // Customer ID: STB-0000001 format
    @Column(unique = true, length = 12)
    private String customerId;
    
    // SSN: Encrypted storage + last 4 digits for display
    @Column(nullable = false, length = 255)
    private String ssnEncrypted;
    
    @Column(nullable = false, length = 4)
    private String ssnLastFour;
    
    // Date of Birth
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    // Place of Birth
    @Column(nullable = false, length = 100)
    private String birthCity;
    
    @Column(nullable = false, length = 50)
    private String birthState;
    
    @Column(nullable = false, length = 50)
    private String birthCountry;
    
    // Member Since (account creation timestamp)
    @Column(nullable = false)
    private LocalDateTime memberSince;
    
    // Security Questions (JSON format)
    @Column(columnDefinition = "TEXT")
    private String securityQuestions;
    
    // Profile Completion Status
    private boolean profileComplete = true;

    // ⭐ PASSWORD RESET FIELDS (NEW ADDITION)
    @Column(name = "reset_token")
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
     
@Column(name = "failed_login_attempts", nullable = false)
private int failedLoginAttempts = 0;

@Column(name = "account_locked", nullable = false)
private boolean accountLocked = false;

@Column(name = "lock_expiry")
private LocalDateTime lockExpiry;

    // ⭐ FINANCIAL INFORMATION FIELDS
    private String employmentStatus;      // EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, RETIRED, STUDENT
    private Double annualIncome;          // Store as Double for monetary values
    private String riskTolerance;         // CONSERVATIVE, MODERATE, AGGRESSIVE (maps to investmentObjective)
    
    // ⭐ TWO NEW FIELDS ADDED - Source of Funds and Tax Bracket
    private String sourceOfFunds;         // EMPLOYMENT, INVESTMENTS, INHERITANCE, etc.
    private String taxBracket;            // 10%, 12%, 22%, etc.

    // ⭐ EXISTING RELATIONSHIPS
    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Account> accounts = new ArrayList<>();

    // ⭐ CONSTRUCTORS
    public User() {
        this.memberSince = LocalDateTime.now(); // Auto-set on creation
    }
    
    public void incrementFailedAttempts() {
    this.failedLoginAttempts++;
}

public void resetFailedAttempts() {
    this.failedLoginAttempts = 0;
}

public boolean isLocked() {
    if (!accountLocked) return false;
    if (lockExpiry != null && lockExpiry.isBefore(LocalDateTime.now())) {
        // Lock expired, auto-unlock
        this.accountLocked = false;
        this.lockExpiry = null;
        return false;
    }
    return accountLocked;
}

public void lockAccount() {
    this.accountLocked = true;
    this.lockExpiry = LocalDateTime.now().plusMinutes(30); // Lock for 30 minutes
}

    // Constructor for registration
    public User(String firstName, String lastName, String email, String password, 
                String phone, LocalDate dateOfBirth, String ssnEncrypted, 
                String ssnLastFour, String birthCity, String birthState, 
                String birthCountry) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.ssnEncrypted = ssnEncrypted;
        this.ssnLastFour = ssnLastFour;
        this.birthCity = birthCity;
        this.birthState = birthState;
        this.birthCountry = birthCountry;
        this.memberSince = LocalDateTime.now();
        this.profileComplete = false; // Will be true after address is set
    }


    private String sessionId;

public String getSessionId() { return sessionId; }
public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    // ⭐ EXISTING GETTERS AND SETTERS (unchanged)
    public Long getId() {
        return id;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public List<Account> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<Account> accounts) {
        this.accounts = accounts;
    }

    // ⭐ NEW GETTERS AND SETTERS
    
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
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

    public LocalDateTime getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(LocalDateTime memberSince) {
        this.memberSince = memberSince;
    }

    public String getSecurityQuestions() {
        return securityQuestions;
    }

    public void setSecurityQuestions(String securityQuestions) {
        this.securityQuestions = securityQuestions;
    }

    public boolean isProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    // ⭐ FINANCIAL INFORMATION GETTERS AND SETTERS
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

    public String getRiskTolerance() {
        return riskTolerance;
    }

    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }
    
    // ⭐ TWO NEW GETTERS AND SETTERS - Source of Funds and Tax Bracket
    public String getSourceOfFunds() {
        return sourceOfFunds;
    }

    public void setSourceOfFunds(String sourceOfFunds) {
        this.sourceOfFunds = sourceOfFunds;
    }

    public String getTaxBracket() {
        return taxBracket;
    }

    public void setTaxBracket(String taxBracket) {
        this.taxBracket = taxBracket;
    }

    // ⭐ EXISTING CONVENIENCE METHOD
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // ⭐ NEW CONVENIENCE METHOD: Get masked SSN for display
    public String getSsnMasked() {
        if (ssnLastFour == null || ssnLastFour.length() != 4) {
            return "***-**-****";
        }
        return "***-**-" + ssnLastFour;
    }
    
    // ⭐ NEW CONVENIENCE METHOD: Calculate age from DOB
    public int getAge() {
        if (dateOfBirth == null) {
            return 0;
        }
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }
    
    // ⭐ NEW CONVENIENCE METHOD: Format member since date
    public String getMemberSinceFormatted() {
        if (memberSince == null) {
            return "N/A";
        }
        return memberSince.toLocalDate().toString();
    }
    
    // ⭐ PASSWORD RESET GETTERS AND SETTERS (NEW ADDITION)
    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    public int getFailedLoginAttempts() {
    return failedLoginAttempts;
}

public void setFailedLoginAttempts(int failedLoginAttempts) {
    this.failedLoginAttempts = failedLoginAttempts;
}

public boolean isAccountLocked() {
    return accountLocked;
}

public void setAccountLocked(boolean accountLocked) {
    this.accountLocked = accountLocked;
}

public LocalDateTime getLockExpiry() {
    return lockExpiry;
}

public void setLockExpiry(LocalDateTime lockExpiry) {
    this.lockExpiry = lockExpiry;
}
}
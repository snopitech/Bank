package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.USVerification;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.USVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class USVerificationService {

    @Autowired
    private USVerificationRepository usVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private SsnService ssnService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    // ==================== SUBMIT US CITIZEN VERIFICATION ====================

    @Transactional
    public USVerification submitVerification(
            String email,
            String firstName,
            String lastName,
            String phone,
            LocalDateTime dateOfBirth,
            String ssn,
            String birthCity,
            String birthState,
            String birthCountry,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String zipCode,
            String country,
            String employmentStatus,
            String annualIncome,
            String sourceOfFunds,
            String riskTolerance,
            String taxBracket,
            String password,
            String securityQuestionsJson) {
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered: " + email);
        }

        // Check if already has pending verification
        if (hasPendingVerification(email)) {
            throw new RuntimeException("You already have a pending verification");
        }

        // Encrypt SSN
        String encryptedSsn = ssnService.encryptSsn(ssn);
        String ssnLastFour = ssnService.getLastFour(ssn);

        // ⭐ CONVERT ANNUAL INCOME FROM STRING TO DOUBLE
        Double parsedAnnualIncome = null;
        if (annualIncome != null && !annualIncome.trim().isEmpty()) {
            // Handle income ranges
            if (annualIncome.contains("$25,000 - $49,999")) parsedAnnualIncome = 37500.0;
            else if (annualIncome.contains("$50,000 - $74,999")) parsedAnnualIncome = 62500.0;
            else if (annualIncome.contains("$75,000 - $99,999")) parsedAnnualIncome = 87500.0;
            else if (annualIncome.contains("$100,000 - $149,999")) parsedAnnualIncome = 125000.0;
            else if (annualIncome.contains("$150,000 - $199,999")) parsedAnnualIncome = 175000.0;
            else if (annualIncome.contains("$200,000 - $299,999")) parsedAnnualIncome = 250000.0;
            else if (annualIncome.contains("$300,000+")) parsedAnnualIncome = 300000.0;
            else if (annualIncome.contains("Under $25,000")) parsedAnnualIncome = 12500.0;
            else {
                // Try to parse as direct number
                try {
                    String cleanValue = annualIncome.replaceAll("[^\\d.]", "");
                    if (!cleanValue.isEmpty()) {
                        parsedAnnualIncome = Double.parseDouble(cleanValue);
                    }
                } catch (NumberFormatException e) {
                    // Ignore, leave as null
                }
            }
        }

        // Create verification record
        USVerification verification = new USVerification();
        verification.setUserId(0L); // Temporary placeholder, will be updated on approval
        verification.setEmail(email);
        verification.setFirstName(firstName);
        verification.setLastName(lastName);
        verification.setPhone(phone);
        verification.setDateOfBirth(dateOfBirth.toLocalDate());
        verification.setSsnEncrypted(encryptedSsn);
        verification.setSsnLastFour(ssnLastFour);
        verification.setBirthCity(birthCity);
        verification.setBirthState(birthState);
        verification.setBirthCountry(birthCountry);
        verification.setAddressLine1(addressLine1);
        verification.setAddressLine2(addressLine2);
        verification.setCity(city);
        verification.setState(state);
        verification.setZipCode(zipCode);
        verification.setCountry(country);
        verification.setEmploymentStatus(employmentStatus);
        verification.setAnnualIncome(parsedAnnualIncome); // ⭐ USE CONVERTED VALUE
        verification.setSourceOfFunds(sourceOfFunds);
        verification.setRiskTolerance(riskTolerance);
        verification.setTaxBracket(taxBracket);
        verification.setPassword(password); // Will be encrypted on approval
        verification.setSecurityQuestions(securityQuestionsJson);
        verification.setStatus("PENDING_REVIEW");

        USVerification saved = usVerificationRepository.save(verification);

        // ==================== SEND UNDER REVIEW EMAIL ====================
        try {
            String subject = "Your Snopitech Bank Account Application";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for applying for a Snopitech Bank account.\n\n" +
                "Your application has been submitted and is currently under review by our team. " +
                "You will receive another email once a decision has been made.\n\n" +
                "If you have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Team",
                firstName, lastName
            );
            emailService.sendSimpleEmail(email, subject, message);
            System.out.println("✅ Under review email sent to: " + email);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send under review email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return saved;
    }

    // ==================== GET VERIFICATIONS ====================

    public USVerification getVerification(Long id) {
        return usVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));
    }

    public List<USVerification> getAllPending() {
        return usVerificationRepository.findAllPending();
    }

    public List<USVerification> getAllApproved() {
        return usVerificationRepository.findAllApproved();
    }

    public List<USVerification> getAllRejected() {
        return usVerificationRepository.findAllRejected();
    }

    public List<USVerification> searchVerifications(String searchTerm) {
        return usVerificationRepository.searchByUserInfo(searchTerm);
    }

    // ==================== CHECK PENDING STATUS ====================
    
    public boolean hasPendingVerification(String email) {
        return usVerificationRepository.existsByEmailAndStatus(email, "PENDING_REVIEW");
    }

    // ==================== APPROVE VERIFICATION ====================

    @Transactional
    public User approveVerification(Long id, String adminUsername) {
        USVerification verification = getVerification(id);

        if (!verification.isPending()) {
            throw new RuntimeException("Verification is not pending");
        }

        // Check if email already exists (double-check)
        if (userRepository.existsByEmail(verification.getEmail())) {
            throw new RuntimeException("Email already registered: " + verification.getEmail());
        }
        
         
        // Encrypt password
        String encryptedPassword = passwordService.encryptPassword(verification.getPassword());

        // Create new user
        User newUser = new User(
            verification.getFirstName(),
            verification.getLastName(),
            verification.getEmail(),
            encryptedPassword,
            verification.getPhone(),
            verification.getDateOfBirth(),
            verification.getSsnEncrypted(),
            verification.getSsnLastFour(),
            verification.getBirthCity(),
            verification.getBirthState(),
            verification.getBirthCountry()
        );

        // Set address
        newUser.setAddressLine1(verification.getAddressLine1());
        newUser.setAddressLine2(verification.getAddressLine2());
        newUser.setCity(verification.getCity());
        newUser.setState(verification.getState());
        newUser.setZipCode(verification.getZipCode());
        newUser.setCountry(verification.getCountry());

        // Set financial information
        newUser.setEmploymentStatus(verification.getEmploymentStatus());
        newUser.setAnnualIncome(verification.getAnnualIncome());
        newUser.setSourceOfFunds(verification.getSourceOfFunds());
        newUser.setRiskTolerance(verification.getRiskTolerance());
        newUser.setTaxBracket(verification.getTaxBracket());

        // Set security questions
        newUser.setSecurityQuestions(verification.getSecurityQuestions());

        // Create user with accounts
        User savedUser = userService.createUser(newUser);

        // Update verification
        verification.approve(adminUsername);
        verification.setUserId(savedUser.getId());
        usVerificationRepository.save(verification);

        // ==================== SEND WELCOME EMAIL ====================
        try {
            String subject = "Welcome to Snopitech Bank - Account Approved!";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Congratulations! Your account has been approved.\n\n" +
                "You can now log in with your email: %s\n\n" +
                "Thank you for choosing Snopitech Bank.",
                savedUser.getFirstName(), savedUser.getLastName(), savedUser.getEmail()
            );
            emailService.sendSimpleEmail(savedUser.getEmail(), subject, message);
            System.out.println("✅ Welcome email sent to: " + savedUser.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send welcome email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return savedUser;
    }

    // ==================== REJECT VERIFICATION ====================

    @Transactional
    public USVerification rejectVerification(Long id, String adminUsername, String reason) {
        USVerification verification = getVerification(id);

        if (!verification.isPending()) {
            throw new RuntimeException("Verification is not pending");
        }

        verification.reject(adminUsername, reason);
        USVerification rejected = usVerificationRepository.save(verification);

        // ==================== SEND REJECTION EMAIL ====================
        try {
            String subject = "Update on Your Snopitech Bank Account Application";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for your interest in Snopitech Bank.\n\n" +
                "After careful review, we regret to inform you that we are unable to approve your account at this time.\n\n" +
                "Reason: %s\n\n" +
                "If you have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Team",
                verification.getFirstName(), verification.getLastName(), reason
            );
            emailService.sendSimpleEmail(verification.getEmail(), subject, message);
            System.out.println("✅ Rejection email sent to: " + verification.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send rejection email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return rejected;
    }

    // ==================== STATISTICS ====================

    public VerificationStats getStatistics() {
        VerificationStats stats = new VerificationStats();
        stats.setTotal(usVerificationRepository.count());
        stats.setPending(usVerificationRepository.countByStatus("PENDING_REVIEW"));
        stats.setApproved(usVerificationRepository.countByStatus("APPROVED"));
        stats.setRejected(usVerificationRepository.countByStatus("REJECTED"));
        return stats;
    }

    // Inner class for statistics
    public static class VerificationStats {
        private long total;
        private long pending;
        private long approved;
        private long rejected;

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getPending() { return pending; }
        public void setPending(long pending) { this.pending = pending; }
        public long getApproved() { return approved; }
        public void setApproved(long approved) { this.approved = approved; }
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
    }
}
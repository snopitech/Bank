package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.LoginRequest;
import com.snopitech.snopitechbank.dto.RegistrationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.snopitech.snopitechbank.dto.ChangeEmailRequestDTO;
import com.snopitech.snopitechbank.dto.ConfirmEmailChangeDTO;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.service.PasswordService;
import com.snopitech.snopitechbank.service.SsnService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.service.VerificationService;
import com.snopitech.snopitechbank.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import com.snopitech.snopitechbank.model.PendingVerification;
import com.snopitech.snopitechbank.repository.PendingVerificationRepository;
import java.util.HashMap;
import java.util.Map;
import com.snopitech.snopitechbank.dto.VerifyCodeRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final SsnService ssnService;
    private final UserService userService;
    private final EmailService emailService;
    private final VerificationService verificationService;
    @Autowired
    private PendingVerificationRepository pendingVerificationRepository;

public AuthController(UserRepository userRepository, 
                     PasswordService passwordService,
                     SsnService ssnService,
                     UserService userService,
                     EmailService emailService,
                     VerificationService verificationService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.ssnService = ssnService;
    this.userService = userService;
    this.emailService = emailService;
    this.verificationService = verificationService;
}

    // ========== LOGIN ==========
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("🔐 Login attempt for: " + request.getEmail());
            
            // Find user WITH ACCOUNTS (eager loaded)
            User user = userRepository.findByEmail(request.getEmail());

            if (user == null) {
                System.out.println("❌ User not found: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            // Check if account is locked
            if (user.isLocked()) {
                return ResponseEntity.status(403).body("Account is temporarily locked. Please try again later or contact support.");
            }

            // Check password
            boolean passwordMatches = passwordService.verifyPassword(
                request.getPassword(), 
                user.getPassword()
            );
            
            if (!passwordMatches) {
                System.out.println("❌ Password mismatch for: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            // Generate and send verification code
            verificationService.createAndSendCode(user);

            // Return response with requiresCode flag
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", user.getId());
            response.put("requiresCode", true);
            response.put("message", "Verification code sent to your email");

            System.out.println("✅ Password verified for: " + user.getEmail() + ". Code sent.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("💥 Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Login failed: " + e.getMessage());
        }
    }

    // ========== REGISTRATION ==========
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        try {
            System.out.println("📝 Registration attempt for: " + request.getEmail());
            System.out.println("   Verification type: " + request.getVerificationType());
            
            // Check if email exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body("Email already registered: " + request.getEmail());
            }

            // Validate password match
            if (!request.isPasswordMatching()) {
                return ResponseEntity.badRequest()
                    .body("Password and confirm password do not match");
            }

            // Validate age (18+)
            java.time.LocalDate dateOfBirth = request.getDateOfBirth();
            if (dateOfBirth != null) {
                int age = java.time.LocalDate.now().getYear() - dateOfBirth.getYear();
                if (java.time.LocalDate.now().getDayOfYear() < dateOfBirth.getDayOfYear()) {
                    age--;
                }
                if (age < 18) {
                    return ResponseEntity.badRequest()
                        .body("User must be at least 18 years old. Current age: " + age);
                }
            }

            // Get verification type
            String verificationType = request.getVerificationType();
            @SuppressWarnings("unused")
            Boolean testMode = request.getTestMode() != null ? request.getTestMode() : false;

            // Conditional SSN validation
            String ssn = request.getSsn();
            String encryptedSsn;
            String ssnLastFour;

            // For US citizens, SSN is required and must be valid
            if ("us".equals(verificationType)) {
                if (ssn == null || ssn.replace("-", "").length() != 9) {
                    return ResponseEntity.badRequest()
                        .body("SSN must be 9 digits (format: 123-45-6789)");
                }
                // Encrypt SSN for US citizens
                encryptedSsn = ssnService.encryptSsn(ssn);
                ssnLastFour = ssnService.getLastFour(ssn);
                System.out.println("   US Citizen - SSN validated and encrypted");
            } 
            // For test mode and non-US citizens, use placeholder
            else {
                System.out.println("   " + ("test".equals(verificationType) ? "🧪 Test mode" : "🌍 Non-US citizen") + " - using placeholder SSN");
                // Use a placeholder for test and non-US accounts
                encryptedSsn = ssnService.encryptSsn("000-00-0000");
                ssnLastFour = "0000";
            }

            // Encrypt password
            String encryptedPassword = passwordService.encryptPassword(request.getPassword());

            // Create user with basic info
            User newUser = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                encryptedPassword,
                request.getPhone(),
                request.getDateOfBirth(),
                encryptedSsn,
                ssnLastFour,
                request.getBirthCity(),
                request.getBirthState(),
                request.getBirthCountry()
            );

            // ⭐ SET FINANCIAL INFORMATION FIELDS FROM REGISTRATION
            if (request.getEmploymentStatus() != null) {
                newUser.setEmploymentStatus(request.getEmploymentStatus());
                System.out.println("   Employment Status: " + request.getEmploymentStatus());
            }
            
            if (request.getAnnualIncome() != null) {
                newUser.setAnnualIncome(request.getAnnualIncomeAsDouble());
                System.out.println("   Annual Income: " + request.getAnnualIncome() + " → " + request.getAnnualIncomeAsDouble());
            }
            
            if (request.getSourceOfFunds() != null) {
                newUser.setSourceOfFunds(request.getSourceOfFunds());
                System.out.println("   Source of Funds: " + request.getSourceOfFunds());
            }
            
            if (request.getRiskTolerance() != null) {
                newUser.setRiskTolerance(request.getRiskTolerance());
                System.out.println("   Risk Tolerance: " + request.getRiskTolerance());
            }
            
            if (request.getTaxBracket() != null) {
                newUser.setTaxBracket(request.getTaxBracket());
                System.out.println("   Tax Bracket: " + request.getTaxBracket());
            }

            // Create user with accounts
            User savedUser = userService.createUser(newUser);
            
            // Fetch user WITH ACCOUNTS (eager loaded)
            User userWithAccounts = userRepository.findById(savedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found after creation"));

            System.out.println("✅ Registration successful!");
            System.out.println("👤 Customer ID: " + userWithAccounts.getCustomerId());
            System.out.println("📊 Accounts created: " + 
                (userWithAccounts.getAccounts() != null ? userWithAccounts.getAccounts().size() : 0));
            System.out.println("💰 Financial Info Saved: " + 
                "Status=" + userWithAccounts.getEmploymentStatus() + 
                ", Income=" + userWithAccounts.getAnnualIncome() +
                ", Source=" + userWithAccounts.getSourceOfFunds() +
                ", Risk=" + userWithAccounts.getRiskTolerance() +
                ", Tax=" + userWithAccounts.getTaxBracket());
            
            if (userWithAccounts.getAccounts() != null && !userWithAccounts.getAccounts().isEmpty()) {
                userWithAccounts.getAccounts().forEach(account -> {
                    System.out.println("   - " + account.getAccountType() + 
                                     " #" + account.getAccountNumber() + 
                                     " ($" + account.getBalance() + ")");
                });
            }

            // Return full User entity (same as login)
            return ResponseEntity.ok(userWithAccounts);

        } catch (Exception e) {
            System.err.println("💥 Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Registration failed: " + e.getMessage());
        }
    }

    // ========== EMAIL CHANGE ENDPOINTS ==========

    @PostMapping("/change-email/request")
    public ResponseEntity<?> requestEmailChange(@RequestBody ChangeEmailRequestDTO request) {
        try {
            System.out.println("📧 Email change request from: " + request.getCurrentEmail() + " to: " + request.getNewEmail());
            
            // Verify current email exists
            User user = userRepository.findByEmail(request.getCurrentEmail());
            if (user == null) {
                return ResponseEntity.badRequest().body("Current email not found.");
            }
            
            // Check if new email is already in use
            if (userRepository.existsByEmail(request.getNewEmail())) {
                return ResponseEntity.badRequest().body("New email is already in use.");
            }
            
            // Generate email change token
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusHours(1); // 1 hour expiry
            
            // Save token to user (we're reusing resetToken field for email change)
            user.setResetToken(token);
            user.setResetTokenExpiry(expiryDate);
            userRepository.save(user);
            
            // Send verification email to OLD email
            String verificationLink = "http://localhost:5173/verify-email-change?token=" + token + "&newEmail=" + request.getNewEmail();
            emailService.sendEmailChangeVerification(
                request.getCurrentEmail(), 
                user.getFirstName(), 
                verificationLink,
                request.getNewEmail()
            );
            
            System.out.println("✅ Email change token generated for: " + user.getEmail());
            System.out.println("   Token: " + token);
            System.out.println("   Expires: " + expiryDate);
            
            return ResponseEntity.ok().body("Verification link sent to your current email.");
            
        } catch (Exception e) {
            System.err.println("💥 Email change request error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Failed to process email change request.");
        }
    }

    @GetMapping("/verify-email-change/{token}")
    public ResponseEntity<?> verifyEmailChangeToken(@PathVariable String token, @RequestParam String newEmail) {
        try {
            System.out.println("🔍 Verifying email change token: " + token + " for new email: " + newEmail);
            
            User user = userRepository.findByResetToken(token).orElse(null);
            
            if (user == null) {
                System.out.println("❌ Email change token not found");
                return ResponseEntity.status(404).body("Invalid or expired token.");
            }
            
            if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                System.out.println("❌ Email change token expired");
                return ResponseEntity.status(400).body("Token has expired.");
            }
            
            // Check if new email is still available
            if (userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body("New email is already in use.");
            }
            
            System.out.println("✅ Email change token is valid for user: " + user.getEmail());
            return ResponseEntity.ok().body("Token is valid. You can now confirm email change.");
            
        } catch (Exception e) {
            System.err.println("💥 Email change token verification error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Token verification failed.");
        }
    }

    @PostMapping("/confirm-email-change")
    public ResponseEntity<?> confirmEmailChange(@RequestBody ConfirmEmailChangeDTO request) {
        try {
            System.out.println("✅ Confirming email change with token: " + request.getToken() + " to: " + request.getNewEmail());
            
            // Verify token
            User user = userRepository.findByResetToken(request.getToken()).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body("Invalid or expired token.");
            }
            
            if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(400).body("Token has expired.");
            }
            
            // Check if new email is still available
            if (userRepository.existsByEmail(request.getNewEmail())) {
                return ResponseEntity.badRequest().body("New email is already in use.");
            }
            
            // Update email
            String oldEmail = user.getEmail();
            user.setEmail(request.getNewEmail());
            
            // Clear token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            
            System.out.println("✅ Email updated from " + oldEmail + " to " + request.getNewEmail());
            
            return ResponseEntity.ok().body("Email updated successfully!");
            
        } catch (Exception e) {
            System.err.println("💥 Email change confirmation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Failed to confirm email change.");
        }
    }
    
    // ========== 2FA VERIFICATION ENDPOINTS ==========
    
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is locked
            if (user.isAccountLocked()) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Account is locked. Please contact support or try again after 30 minutes."
                ));
            }

            boolean isValid = verificationService.verifyCode(user, request.getCode());

            if (!isValid) {
                // Increment failed attempts
                user.incrementFailedAttempts();
                
                // Lock account after 3 failed attempts
                if (user.getFailedLoginAttempts() >= 3) {
                    user.lockAccount();
                    userRepository.save(user);
                    return ResponseEntity.status(403).body(Map.of(
                        "error", "Too many failed attempts. Account locked for 30 minutes."
                    ));
                }
                
                userRepository.save(user);
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Invalid verification code",
                    "attemptsRemaining", 3 - user.getFailedLoginAttempts()
                ));
            }

            // Success - reset failed attempts and unlock if previously locked
            user.resetFailedAttempts();
            user.setAccountLocked(false);
            user.setLockExpiry(null);
            
            String sessionId = UUID.randomUUID().toString();
            user.setSessionId(sessionId);
            userRepository.save(user);

            user.setPassword(null);
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is locked
            if (user.isAccountLocked()) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Account is locked. Cannot resend code."
                ));
            }

            verificationService.resendCode(user);
            return ResponseEntity.ok("New verification code sent");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to resend code: " + e.getMessage());
        }
    }
   
   @PostMapping(value = "/register/pending", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> registerPending(
        @RequestPart("userData") String userDataJson,
        @RequestPart("document") MultipartFile document) {
    try {
        // Convert JSON string to RegistrationRequest object
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        RegistrationRequest request = mapper.readValue(userDataJson, RegistrationRequest.class);
        
        System.out.println("📝 PENDING REGISTRATION for: " + request.getEmail());
        System.out.println("   Document received: " + document.getOriginalFilename());
        System.out.println("   Document size: " + document.getSize());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body("Email already registered: " + request.getEmail());
        }

        // Validate password match
        if (!request.isPasswordMatching()) {
            return ResponseEntity.badRequest()
                .body("Password and confirm password do not match");
        }

           // Validate age (18+)
        java.time.LocalDate dateOfBirth = request.getDateOfBirth();
        if (dateOfBirth != null) {
            int age = java.time.LocalDate.now().getYear() - dateOfBirth.getYear();
            if (java.time.LocalDate.now().getDayOfYear() < dateOfBirth.getDayOfYear()) {
                age--;
            }
            if (age < 18) {
                return ResponseEntity.badRequest()
                    .body("User must be at least 18 years old. Current age: " + age);
            }
        }

        // ⭐ SEND UNDER REVIEW EMAIL
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
                request.getFirstName(), request.getLastName()
            );
            emailService.sendSimpleEmail(request.getEmail(), subject, message);
            System.out.println("✅ Under review email sent to: " + request.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send under review email: " + e.getMessage());
            // Don't stop registration if email fails
        }

    
        // ⭐ CREATE PENDING VERIFICATION RECORD
        PendingVerification pendingVerification = new PendingVerification();
        pendingVerification.setUserId(0L);
        pendingVerification.setDocumentType("PASSPORT");
        pendingVerification.setDocumentData(document.getBytes());
        pendingVerification.setDocumentFileName(document.getOriginalFilename());
        pendingVerification.setDocumentContentType(document.getContentType());
        pendingVerification.setDocumentNumber(request.getDocumentNumber());
        pendingVerification.setIssuingCountry(request.getIssuingCountry());
        pendingVerification.setExpiryDate(request.getExpiryDate()); // Add this line too
        pendingVerification.setStatus("PENDING_REVIEW");
        pendingVerification.setDocumentPath("");

// ⭐ SAVE USER DATA
pendingVerification.setEmail(request.getEmail());
pendingVerification.setFirstName(request.getFirstName());
pendingVerification.setLastName(request.getLastName());
pendingVerification.setPhone(request.getPhone());
pendingVerification.setDateOfBirth(request.getDateOfBirth());
pendingVerification.setBirthCity(request.getBirthCity());
pendingVerification.setBirthState(request.getBirthState());
pendingVerification.setBirthCountry(request.getBirthCountry());
pendingVerification.setPassword(request.getPassword());

// ⭐ SAVE ADDRESS DATA with debug
System.out.println("=== ADDRESS DATA FROM REQUEST ===");
System.out.println("addressLine1: '" + request.getAddressLine1() + "'");
System.out.println("addressLine2: '" + request.getAddressLine2() + "'");
System.out.println("city: '" + request.getCity() + "'");
System.out.println("state: '" + request.getState() + "'");
System.out.println("zipCode: '" + request.getZipCode() + "'");
System.out.println("country: '" + request.getCountry() + "'");
System.out.println("===================================");

pendingVerification.setAddressLine1(request.getAddressLine1());
pendingVerification.setAddressLine2(request.getAddressLine2());
pendingVerification.setCity(request.getCity());
pendingVerification.setState(request.getState());
pendingVerification.setZipCode(request.getZipCode());
pendingVerification.setCountry(request.getCountry());

// ⭐ SAVE FINANCIAL DATA
pendingVerification.setEmploymentStatus(request.getEmploymentStatus());
pendingVerification.setAnnualIncome(request.getAnnualIncomeAsDouble());
pendingVerification.setSourceOfFunds(request.getSourceOfFunds());
pendingVerification.setRiskTolerance(request.getRiskTolerance());
pendingVerification.setTaxBracket(request.getTaxBracket());
System.out.println("=== FINANCIAL DATA CONVERSION ===");
System.out.println("Raw annualIncome string: '" + request.getAnnualIncome() + "'");
System.out.println("Converted to Double: " + request.getAnnualIncomeAsDouble());
System.out.println("==================================");

// ⭐ SAVE SECURITY QUESTIONS - with null checks
String securityQuestionsJson = String.format(
    "[{\"question\":\"%s\",\"answer\":\"%s\"},{\"question\":\"%s\",\"answer\":\"%s\"},{\"question\":\"%s\",\"answer\":\"%s\"}]",
    request.getSecurityQuestion1() != null ? request.getSecurityQuestion1() : "",
    request.getSecurityAnswer1() != null ? request.getSecurityAnswer1() : "",
    request.getSecurityQuestion2() != null ? request.getSecurityQuestion2() : "",
    request.getSecurityAnswer2() != null ? request.getSecurityAnswer2() : "",
    request.getSecurityQuestion3() != null ? request.getSecurityQuestion3() : "",
    request.getSecurityAnswer3() != null ? request.getSecurityAnswer3() : ""
);
pendingVerification.setSecurityQuestions(securityQuestionsJson);

        System.out.println("=== DEBUG BEFORE SAVE ===");
        System.out.println("Email: " + pendingVerification.getEmail());
        System.out.println("First Name: " + pendingVerification.getFirstName());
        System.out.println("Last Name: " + pendingVerification.getLastName());
        System.out.println("Password: " + (pendingVerification.getPassword() != null ? "Set" : "NULL"));
        System.out.println("Document Name: " + document.getOriginalFilename());
        System.out.println("Document Size: " + document.getSize());
        System.out.println("=========================");

        // Save to database (single save)
        PendingVerification saved = pendingVerificationRepository.save(pendingVerification);
        System.out.println("✅ Saved with ID: " + saved.getId());

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", "PENDING_REVIEW");
        response.put("message", "Your registration is pending admin review. You will be notified once approved.");
        response.put("email", request.getEmail());
        
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        System.err.println("💥 Pending registration error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.internalServerError()
            .body("Registration failed: " + e.getMessage());
    }
}

// ========== ADMIN UNLOCK ACCOUNT ==========
@PostMapping("/admin/unlock-user/{userId}")
public ResponseEntity<?> unlockUser(@PathVariable Long userId) {
    try {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User account unlocked successfully"
        ));
        
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
            .body(Map.of("error", e.getMessage()));
    }
}
}
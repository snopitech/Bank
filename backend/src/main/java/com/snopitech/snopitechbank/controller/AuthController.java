package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.LoginRequest;
import com.snopitech.snopitechbank.dto.RegistrationRequest;
import com.snopitech.snopitechbank.dto.ChangeEmailRequestDTO;
import com.snopitech.snopitechbank.dto.ConfirmEmailChangeDTO;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.service.PasswordService;
import com.snopitech.snopitechbank.service.SsnService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final SsnService ssnService;
    private final UserService userService;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, 
                         PasswordService passwordService,
                         SsnService ssnService,
                         UserService userService,
                         EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.ssnService = ssnService;
        this.userService = userService;
        this.emailService = emailService;
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

            // Check password
            boolean passwordMatches = passwordService.verifyPassword(
                request.getPassword(), 
                user.getPassword()
            );
            
            if (!passwordMatches) {
                System.out.println("❌ Password mismatch for: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            // ✅ ADDED: Generate session ID and save to user
            String sessionId = UUID.randomUUID().toString();
            user.setSessionId(sessionId);
            userRepository.save(user);

            // Debug: Check accounts
            System.out.println("✅ Login successful for: " + user.getEmail());
            System.out.println("🔑 Session ID generated: " + sessionId);
            System.out.println("📊 Accounts count: " + (user.getAccounts() != null ? user.getAccounts().size() : 0));
            
            if (user.getAccounts() != null && !user.getAccounts().isEmpty()) {
                user.getAccounts().forEach(account -> {
                    System.out.println("   - " + account.getAccountType() + 
                                     " #" + account.getAccountNumber() + 
                                     " ($" + account.getBalance() + ")");
                });
            }

            // Make sure sessionId is included in response
            user.setPassword(null); // Don't send password
            return ResponseEntity.ok(user);
            
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

            // Validate SSN
            String ssn = request.getSsn();
            if (ssn == null || ssn.replace("-", "").length() != 9) {
                return ResponseEntity.badRequest()
                    .body("SSN must be 9 digits (format: 123-45-6789)");
            }

            // Encrypt sensitive data
            String encryptedPassword = passwordService.encryptPassword(request.getPassword());
            String encryptedSsn = ssnService.encryptSsn(ssn);
            String ssnLastFour = ssnService.getLastFour(ssn);

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

    // ========== EMAIL CHANGE ENDPOINTS (NEW - FOR PROFILE PAGE) ==========

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
}
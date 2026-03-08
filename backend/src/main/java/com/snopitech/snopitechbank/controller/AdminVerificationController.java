package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.PendingVerification;
import com.snopitech.snopitechbank.repository.PendingVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.service.PasswordService;
import com.snopitech.snopitechbank.service.SsnService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.service.EmailService;

import java.util.List;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/verifications")
public class AdminVerificationController {

    @Autowired
private PendingVerificationRepository pendingVerificationRepository;

@Autowired
private UserRepository userRepository;

@Autowired
private UserService userService;

@Autowired
private PasswordService passwordService;

@Autowired
private SsnService ssnService;

@Autowired
private EmailService emailService;

@GetMapping("/test")
public String test() {
    return "Admin verification controller is working";
}
@GetMapping("/debug")
public Map<String, String> debug() {
    Map<String, String> map = new HashMap<>();
    map.put("test", "GET /test works");
    map.put("pending", "GET /pending should work");
    map.put("approve", "POST /{id}/approve should work");
    map.put("controller", "AdminVerificationController is loaded");
    return map;
}

    /**
     * Get all pending verifications
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingVerifications() {
        try {
            List<PendingVerification> pendingList = pendingVerificationRepository.findAllPending();

            // Return only the data needed for the list view
            List<Map<String, Object>> simplifiedList = pendingList.stream().map(v -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", v.getId());
                map.put("userId", v.getUserId());
                map.put("documentType", v.getDocumentType());
                map.put("documentFileName", v.getDocumentFileName());
                map.put("status", v.getStatus());
                map.put("submittedAt", v.getSubmittedAt());
                return map;
            }).toList();
            
            return ResponseEntity.ok(simplifiedList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching verifications");
        }
    }
    
    /**
     * Get all approved verifications
     */
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedVerifications() {
        try {
            List<PendingVerification> approvedList = pendingVerificationRepository.findByStatus("APPROVED");

            // Return only the data needed for the list view
            List<Map<String, Object>> simplifiedList = approvedList.stream().map(v -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", v.getId());
                map.put("userId", v.getUserId());
                map.put("documentType", v.getDocumentType());
                map.put("documentFileName", v.getDocumentFileName());
                map.put("status", v.getStatus());
                map.put("submittedAt", v.getSubmittedAt());
                return map;
            }).toList();
            
            return ResponseEntity.ok(simplifiedList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching approved verifications");
        }
    }
    
    /**
     * Get all rejected verifications
     */
    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedVerifications() {
        try {
            List<PendingVerification> rejectedList = pendingVerificationRepository.findByStatus("REJECTED");

            // Return only the data needed for the list view
            List<Map<String, Object>> simplifiedList = rejectedList.stream().map(v -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", v.getId());
                map.put("userId", v.getUserId());
                map.put("documentType", v.getDocumentType());
                map.put("documentFileName", v.getDocumentFileName());
                map.put("status", v.getStatus());
                map.put("submittedAt", v.getSubmittedAt());
                return map;
            }).toList();
            
            return ResponseEntity.ok(simplifiedList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching rejected verifications");
        }
    }
    
    @PostMapping("/test-post")
public String testPost() {
    return "Admin verification POST controller is working";
}

    /**
     * Get single verification details (for review page)
     */
   @GetMapping("/{id}")
public ResponseEntity<?> getVerification(@PathVariable Long id) {
    try {
        PendingVerification verification = pendingVerificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        // Document info
        response.put("id", verification.getId());
        response.put("userId", verification.getUserId());
        response.put("documentType", verification.getDocumentType());
        response.put("documentFileName", verification.getDocumentFileName());
        response.put("documentContentType", verification.getDocumentContentType());
        response.put("fileSize", verification.getFileSizeAsString());
        response.put("documentNumber", verification.getDocumentNumber());
        response.put("issuingCountry", verification.getIssuingCountry());
        response.put("expiryDate", verification.getExpiryDate());
        
        // PERSONAL INFO
        response.put("firstName", verification.getFirstName());
        response.put("lastName", verification.getLastName());
        response.put("email", verification.getEmail());
        response.put("phone", verification.getPhone());
        response.put("dateOfBirth", verification.getDateOfBirth());
        
        // ADDRESS INFO
        response.put("addressLine1", verification.getAddressLine1());
        response.put("addressLine2", verification.getAddressLine2());
        response.put("city", verification.getCity());
        response.put("state", verification.getState());
        response.put("zipCode", verification.getZipCode());
        response.put("country", verification.getCountry());
        
        // FINANCIAL INFO
        response.put("employmentStatus", verification.getEmploymentStatus());
        response.put("annualIncome", verification.getAnnualIncome());
        response.put("sourceOfFunds", verification.getSourceOfFunds());
        response.put("riskTolerance", verification.getRiskTolerance());
        response.put("taxBracket", verification.getTaxBracket());
        
        // BIRTH INFO
        response.put("birthCity", verification.getBirthCity());
        response.put("birthState", verification.getBirthState());
        response.put("birthCountry", verification.getBirthCountry());
        
        // Status info
        response.put("status", verification.getStatus());
        response.put("submittedAt", verification.getSubmittedAt());
        
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
    /**
     * Download document image
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        try {
            PendingVerification verification = pendingVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "inline; filename=\"" + verification.getDocumentFileName() + "\"")
                .contentType(MediaType.parseMediaType(verification.getDocumentContentType()))
                .body(verification.getDocumentData());
                
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
public ResponseEntity<?> getUserVerifications(
        @PathVariable Long userId,
        @RequestParam(required = false) String status) {
    try {
        List<PendingVerification> verifications;
        if (status != null && !status.isEmpty() && !"ALL".equals(status)) {
            // You'll need to add this method to your repository
            verifications = pendingVerificationRepository.findByUserIdAndStatus(userId, status);
        } else {
            verifications = pendingVerificationRepository.findByUserId(userId);
        }
        return ResponseEntity.ok(verifications);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
    
    @DeleteMapping("/{id}")
public ResponseEntity<?> deleteVerification(@PathVariable Long id) {
    try {
        pendingVerificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Verification deleted"));
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
    }
}

      /**
 * Delete all test verifications (for HR cleanup)
 * DELETE /api/admin/verifications/cleanup
 */
@DeleteMapping("/cleanup")
public ResponseEntity<?> cleanupTestVerifications(@RequestParam(required = false) Integer olderThanDays) {
    try {
        int deletedCount;
        
        if (olderThanDays != null && olderThanDays > 0) {
            // Delete verifications older than X days
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(olderThanDays);
            deletedCount = pendingVerificationRepository.deleteBySubmittedAtBefore(cutoffDate);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Deleted " + deletedCount + " verifications older than " + olderThanDays + " days",
                "deletedCount", deletedCount
            ));
        } else {
            // Delete ALL verifications (use with caution!)
            deletedCount = (int) pendingVerificationRepository.count();
            pendingVerificationRepository.deleteAll();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Deleted all " + deletedCount + " verifications",
                "deletedCount", deletedCount
            ));
        }
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of(
            "error", "Failed to cleanup verifications: " + e.getMessage()
        ));
    }
}

    /**
 * Approve verification
 */
@PostMapping("/{id}/approve")
public ResponseEntity<?> approveVerification(@PathVariable Long id, @RequestParam String adminUsername) {
    System.out.println("=== APPROVE METHOD HIT ===");
    System.out.println("ID: " + id);
    System.out.println("Admin: " + adminUsername);
    
    try {
        System.out.println("1. Finding verification...");
        PendingVerification verification = pendingVerificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        System.out.println("   Found verification for email: " + verification.getEmail());
        
        System.out.println("2. Checking if email exists...");
        if (userRepository.existsByEmail(verification.getEmail())) {
            System.out.println("   Email already exists!");
            return ResponseEntity.badRequest()
                .body("Email already registered: " + verification.getEmail());
        }
        System.out.println("   Email is available");
        
        System.out.println("3. Encrypting password...");
        String encryptedPassword = passwordService.encryptPassword(verification.getPassword());
        System.out.println("   Password encrypted");
        
        System.out.println("4. Setting SSN...");
        String encryptedSsn = ssnService.encryptSsn("000-00-0000");
        String ssnLastFour = "0000";
        System.out.println("   SSN set");
        
        System.out.println("5. Creating User object...");
        // Create user using the same constructor as AuthController
User newUser = new User(
    verification.getFirstName(),
    verification.getLastName(),
    verification.getEmail(),
    encryptedPassword,
    verification.getPhone(),
    verification.getDateOfBirth(),
    encryptedSsn,
    ssnLastFour,
    verification.getBirthCity(),
    verification.getBirthState(),
    verification.getBirthCountry()
);

// ⭐ ADD THESE LINES TO SET ADDRESS
newUser.setAddressLine1(verification.getAddressLine1());
newUser.setAddressLine2(verification.getAddressLine2());
newUser.setCity(verification.getCity());
newUser.setState(verification.getState());
newUser.setZipCode(verification.getZipCode());
newUser.setCountry(verification.getCountry());

// ⭐ ADD THIS TO SET SECURITY QUESTIONS
newUser.setSecurityQuestions(verification.getSecurityQuestions());

        System.out.println("   User object created");
        
        System.out.println("6. Setting financial information...");
        newUser.setEmploymentStatus(verification.getEmploymentStatus());
        newUser.setAnnualIncome(verification.getAnnualIncome());
        newUser.setSourceOfFunds(verification.getSourceOfFunds());
        newUser.setRiskTolerance(verification.getRiskTolerance());
        newUser.setTaxBracket(verification.getTaxBracket());
System.out.println("=== FINANCIAL DATA FROM PENDING ===");
System.out.println("AnnualIncome from DB: " + verification.getAnnualIncome());
System.out.println("AnnualIncome type: " + (verification.getAnnualIncome() != null ? verification.getAnnualIncome().getClass().getName() : "null"));
System.out.println("====================================");


        System.out.println("   Financial info set");
        System.out.println("7. Calling userService.createUser()...");
        User savedUser = userService.createUser(newUser);
        System.out.println("   User created with ID: " + savedUser.getId());       
        System.out.println("8. Updating verification status...");
        verification.approve(adminUsername);
        pendingVerificationRepository.save(verification);
        System.out.println("   Verification updated");
        
        System.out.println("9. Sending email...");
        String subject = "Welcome to Snopitech Bank - Account Approved!";
        String message = String.format(
            "Dear %s %s,\n\n" +
            "Congratulations! Your account has been approved.\n\n" +
            "You can now log in with your email: %s\n\n" +
            "Thank you for choosing Snopitech Bank.",
            savedUser.getFirstName(), savedUser.getLastName(), savedUser.getEmail()
        );
        emailService.sendSimpleEmail(savedUser.getEmail(), subject, message);
        System.out.println("   Email sent");
        
        System.out.println("10. Returning success response");
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", "Verification approved and account created",
            "userId", savedUser.getId()
        ));
        
    } catch (RuntimeException e) {
        System.out.println("!!! RUNTIME EXCEPTION: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        System.out.println("!!! EXCEPTION: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.internalServerError()
            .body(Map.of("error", e.getMessage()));
    }
}

    /**
 * Reject verification
 */
@PostMapping("/{id}/reject")
public ResponseEntity<?> rejectVerification(
        @PathVariable Long id, 
        @RequestParam String adminUsername,
        @RequestParam(required = false) String notes) {
    try {
        PendingVerification verification = pendingVerificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Verification not found"));
        
        verification.reject(adminUsername, notes);
        pendingVerificationRepository.save(verification);
        
        // ⭐ SEND REJECTION EMAIL
        try {
            String subject = "Update on Your Snopitech Bank Account Application";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for your interest in Snopitech Bank.\n\n" +
                "After careful review, we regret to inform you that we are unable to approve your account application at this time.\n\n" +
                "Reason: %s\n\n" +
                "If you have any questions or would like to provide additional information, " +
                "please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Team",
                verification.getFirstName(), verification.getLastName(),
                notes != null ? notes : "No specific reason provided"
            );
            emailService.sendSimpleEmail(verification.getEmail(), subject, message);
            System.out.println("✅ Rejection email sent to: " + verification.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send rejection email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Verification rejected"));
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
}
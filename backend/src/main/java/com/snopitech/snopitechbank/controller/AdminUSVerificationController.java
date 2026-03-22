package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.USVerification;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.USVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.snopitech.snopitechbank.service.SsnService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/us-verifications")
public class AdminUSVerificationController {

    @Autowired
    private USVerificationService usVerificationService;
    @Autowired
     private SsnService ssnService;
    /**
     * Get all pending verifications
     */
   @GetMapping("/pending")
public ResponseEntity<?> getPendingVerifications() {
    try {
        List<USVerification> verifications = usVerificationService.getAllPending();
        
        // Return only data needed for list view
        List<Map<String, Object>> simplifiedList = verifications.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("userId", v.getUserId());
            map.put("firstName", v.getFirstName());
            map.put("lastName", v.getLastName());
            map.put("email", v.getEmail());
            map.put("ssnLastFour", v.getSsnLastFour());
            map.put("ssnMasked", v.getSsnMasked());
            map.put("dateOfBirth", v.getDateOfBirth());
            map.put("status", v.getStatus());
            map.put("submittedAt", v.getSubmittedAt());
            return map;
        }).toList();
        
        return ResponseEntity.ok(simplifiedList);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch verifications"));
    }
}
    /**
     * Get all approved verifications
     */
    @GetMapping("/approved")
public ResponseEntity<?> getApprovedVerifications() {
    try {
        List<USVerification> verifications = usVerificationService.getAllApproved();
        
        // Return only data needed for list view
        List<Map<String, Object>> simplifiedList = verifications.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("userId", v.getUserId());
            map.put("firstName", v.getFirstName());
            map.put("lastName", v.getLastName());
            map.put("email", v.getEmail());
            map.put("ssnLastFour", v.getSsnLastFour());
            map.put("ssnMasked", v.getSsnMasked());
            map.put("dateOfBirth", v.getDateOfBirth());
            map.put("status", v.getStatus());
            map.put("submittedAt", v.getSubmittedAt());
            return map;
        }).toList();
        
        return ResponseEntity.ok(simplifiedList);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch verifications"));
    }
}
    /**
     * Get all rejected verifications
     */
 @GetMapping("/rejected")
public ResponseEntity<?> getRejectedVerifications() {
    try {
        List<USVerification> verifications = usVerificationService.getAllRejected();
        
        // Return only data needed for list view
        List<Map<String, Object>> simplifiedList = verifications.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("userId", v.getUserId());
            map.put("firstName", v.getFirstName());
            map.put("lastName", v.getLastName());
            map.put("email", v.getEmail());
            map.put("ssnLastFour", v.getSsnLastFour());
            map.put("ssnMasked", v.getSsnMasked());
            map.put("dateOfBirth", v.getDateOfBirth());
            map.put("status", v.getStatus());
            map.put("submittedAt", v.getSubmittedAt());
            return map;
        }).toList();
        
        return ResponseEntity.ok(simplifiedList);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch verifications"));
    }
}
    /**
     * Get verification by ID
     */
    @GetMapping("/{id}")
public ResponseEntity<?> getVerification(@PathVariable Long id) {
    try {
        USVerification verification = usVerificationService.getVerification(id);
        
        // Decrypt SSN for display
        String decryptedSsn = ssnService.decryptSsn(verification.getSsnEncrypted());
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", verification.getId());
        response.put("userId", verification.getUserId());
        response.put("email", verification.getEmail());
        response.put("firstName", verification.getFirstName());
        response.put("lastName", verification.getLastName());
        response.put("phone", verification.getPhone());
        response.put("dateOfBirth", verification.getDateOfBirth());
        response.put("ssnLastFour", verification.getSsnLastFour());
        response.put("ssnMasked", verification.getSsnMasked());
        response.put("ssnFull", decryptedSsn); // ⭐ DECRYPTED SSN FOR DISPLAY
        response.put("birthCity", verification.getBirthCity());
        response.put("birthState", verification.getBirthState());
        response.put("birthCountry", verification.getBirthCountry());
        response.put("addressLine1", verification.getAddressLine1());
        response.put("addressLine2", verification.getAddressLine2());
        response.put("city", verification.getCity());
        response.put("state", verification.getState());
        response.put("zipCode", verification.getZipCode());
        response.put("country", verification.getCountry());
        response.put("employmentStatus", verification.getEmploymentStatus());
        response.put("annualIncome", verification.getAnnualIncome());
        response.put("sourceOfFunds", verification.getSourceOfFunds());
        response.put("riskTolerance", verification.getRiskTolerance());
        response.put("taxBracket", verification.getTaxBracket());
        response.put("status", verification.getStatus());
        response.put("submittedAt", verification.getSubmittedAt());
        response.put("reviewedAt", verification.getReviewedAt());
        response.put("reviewedBy", verification.getReviewedBy());
        response.put("adminNotes", verification.getAdminNotes());
        
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
    /**
     * Search verifications by name/email
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchVerifications(@RequestParam String term) {
        try {
            List<USVerification> results = usVerificationService.searchVerifications(term);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve verification
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveVerification(@PathVariable Long id, @RequestParam String adminUsername) {
        try {
            User savedUser = usVerificationService.approveVerification(id, adminUsername);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification approved and account created",
                "userId", savedUser.getId(),
                "email", savedUser.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject verification
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectVerification(
            @PathVariable Long id,
            @RequestParam String adminUsername,
            @RequestParam(required = false) String reason) {
        try {
            USVerification verification = usVerificationService.rejectVerification(id, adminUsername, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification rejected",
                "status", verification.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get verification statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics() {
        try {
            USVerificationService.VerificationStats stats = usVerificationService.getStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public String test() {
        return "Admin US Verification Controller is working!";
    }
}
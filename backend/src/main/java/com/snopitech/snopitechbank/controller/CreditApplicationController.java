package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.CreditApplicationDTO;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditApplication;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.CreditApplicationService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/credit")
public class CreditApplicationController {

    @Autowired
    private CreditApplicationService creditApplicationService;

    @SuppressWarnings("unused")
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;

    // Helper method to get user from sessionId
    private User getUserFromSession(String sessionId) {
        return userRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @RequestHeader("sessionId") String sessionId,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            // Extract fields from request
            String reason = (String) request.get("reason");
            String creditPurpose = (String) request.get("creditPurpose");
            Double requestedLimit = request.get("requestedLimit") != null ? 
                Double.parseDouble(request.get("requestedLimit").toString()) : 5000.0;
            Double monthlyHousingPayment = request.get("monthlyHousingPayment") != null ? 
                Double.parseDouble(request.get("monthlyHousingPayment").toString()) : null;
            Integer yearsAtCurrentAddress = request.get("yearsAtCurrentAddress") != null ? 
                Integer.parseInt(request.get("yearsAtCurrentAddress").toString()) : null;
            String previousAddress = (String) request.get("previousAddress");
            String citizenshipStatus = (String) request.get("citizenshipStatus");
            Boolean agreeToTerms = request.get("agreeToTerms") != null ? 
                Boolean.parseBoolean(request.get("agreeToTerms").toString()) : false;

            // Validate required fields
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
            }

            if (creditPurpose == null || creditPurpose.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Credit purpose is required"));
            }

            if (!agreeToTerms) {
                return ResponseEntity.badRequest().body(Map.of("error", "You must agree to the terms and conditions"));
            }

            if (!creditApplicationService.isEligibleForNewAccount(userId)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "You are not eligible for a new credit account. " +
                           "You may already have a pending application or an active account.")
                );
            }

            // Submit application with all fields
            CreditApplication application = creditApplicationService.submitApplication(
                userId, 
                reason, 
                creditPurpose, 
                requestedLimit,
                monthlyHousingPayment,
                yearsAtCurrentAddress,
                previousAddress,
                citizenshipStatus,
                agreeToTerms
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Credit application submitted successfully");
            response.put("applicationId", application.getId());
            response.put("status", application.getStatus());
            response.put("submittedDate", application.getSubmittedDate());
            response.put("requestedLimit", application.getRequestedLimit());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            List<CreditApplication> applications = creditApplicationService.getUserApplications(userId);
            
            return ResponseEntity.ok(applications);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplication(
            @PathVariable Long id,
            @RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();
            
            CreditApplication application = creditApplicationService.getApplication(id);
            
            if (!application.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this application"));
            }
            
            return ResponseEntity.ok(application);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/applications/eligibility")
    public ResponseEntity<?> checkEligibility(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            boolean eligible = creditApplicationService.isEligibleForNewAccount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("eligible", eligible);
            response.put("message", eligible ? 
                "You are eligible to apply for a credit account" : 
                "You are not eligible at this time");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS (UPDATED - NO SESSIONID) ====================

    @GetMapping("/admin/applications/pending")
    public ResponseEntity<?> getPendingApplications() {
        try {
            List<CreditApplication> applications = creditApplicationService.getPendingApplications();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/applications")
    public ResponseEntity<?> getApplicationsWithFilters(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        try {
            List<CreditApplicationDTO> applications = creditApplicationService.getApplicationsWithFilters(status, type);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/applications/{id}")
    public ResponseEntity<?> getApplicationAdmin(@PathVariable Long id) {
        try {
            CreditApplication application = creditApplicationService.getApplication(id);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/admin/applications/{id}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long id) {
        try {
            // For now, use a default admin username since we're removing session check
            String adminUsername = "admin@snopitech.com";

            CreditAccount creditAccount = creditApplicationService.approveApplication(id, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application approved successfully");
            response.put("accountId", creditAccount.getId());
            response.put("accountNumber", creditAccount.getMaskedAccountNumber());
            response.put("creditLimit", creditAccount.getCreditLimit());
            response.put("cards", Map.of(
                "physical", "Card generated",
                "virtual", "Card generated"
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/applications/{id}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String adminUsername = "admin@snopitech.com";
            String rejectionReason = request.get("rejectionReason");
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }

            CreditApplication application = creditApplicationService.rejectApplication(
                id, adminUsername, rejectionReason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application rejected successfully");
            response.put("applicationId", application.getId());
            response.put("status", application.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/applications/statistics")
    public ResponseEntity<?> getApplicationStatistics() {
        try {
            CreditApplicationService.ApplicationStatistics stats = 
                creditApplicationService.getApplicationStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== NEW USER-SPECIFIC ADMIN ENDPOINTS ====================

    @GetMapping("/admin/applications/user/{userId}")
    public ResponseEntity<?> getUserApplications(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        try {
            List<CreditApplication> applications;
            if (status != null && !status.isEmpty()) {
                // You'll need to add this method to your service
                applications = creditApplicationService.getUserApplicationsByStatus(userId, status);
            } else {
                applications = creditApplicationService.getUserApplications(userId);
            }
            
            // Convert to DTOs if needed, or just return the applications
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/increase-requests/user/{userId}")
    public ResponseEntity<?> getUserIncreaseRequests(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        try {
            // For now, return empty list - implement when increase requests feature is added
            return ResponseEntity.ok(new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/admin/applications/bulk-action")
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> request) {
        try {
            String adminUsername = "admin@snopitech.com";
            
            List<Long> applicationIds = (List<Long>) request.get("applicationIds");
            String action = (String) request.get("action");
            String reason = (String) request.get("reason");
            
            Map<String, Object> results = new HashMap<>();
            int success = 0;
            int failed = 0;
            
            for (Long id : applicationIds) {
                try {
                    if ("approve".equalsIgnoreCase(action)) {
                        creditApplicationService.approveApplication(id, adminUsername);
                    } else if ("reject".equalsIgnoreCase(action)) {
                        creditApplicationService.rejectApplication(id, adminUsername, reason);
                    }
                    success++;
                } catch (Exception e) {
                    failed++;
                }
            }
            
            results.put("success", success);
            results.put("failed", failed);
            results.put("message", success + " applications processed, " + failed + " failed");
            
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
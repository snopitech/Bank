package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.LoanApplication;
import com.snopitech.snopitechbank.service.LoanApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/loan")
public class AdminLoanApplicationController {

    @Autowired
    private LoanApplicationService loanApplicationService;

    // ==================== GET ALL APPLICATIONS ====================

    /**
     * GET /api/admin/loan/applications/pending
     * Get all pending loan applications
     */
@GetMapping("/applications/pending")
public ResponseEntity<?> getPendingApplications() {
    try {
        List<LoanApplication> applications = loanApplicationService.getAllPending();
        
        // Return with user details
        List<Map<String, Object>> response = applications.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("userId", app.getUser().getId());
            map.put("userFirstName", app.getUser().getFirstName());
            map.put("userLastName", app.getUser().getLastName());
            map.put("userEmail", app.getUser().getEmail());
            map.put("requestedAmount", app.getRequestedAmount());
            map.put("loanPurpose", app.getLoanPurpose());
            map.put("requestedTermMonths", app.getRequestedTermMonths());
            map.put("status", app.getStatus());
            map.put("submittedAt", app.getSubmittedAt());
            return map;
        }).toList();
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch applications"));
    }
}

    /**
     * GET /api/admin/loan/applications/approved
     * Get all approved loan applications
     */
    @GetMapping("/applications/approved")
    public ResponseEntity<?> getApprovedApplications() {
        try {
            List<LoanApplication> applications = loanApplicationService.getAllApproved();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch applications"));
        }
    }

    /**
     * GET /api/admin/loan/applications/rejected
     * Get all rejected loan applications
     */
    @GetMapping("/applications/rejected")
    public ResponseEntity<?> getRejectedApplications() {
        try {
            List<LoanApplication> applications = loanApplicationService.getAllRejected();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch applications"));
        }
    }

    /**
     * GET /api/admin/loan/applications/all
     * Get all loan applications (with optional status filter)
     */
    @GetMapping("/applications/all")
    public ResponseEntity<?> getAllApplications(@RequestParam(required = false) String status) {
        try {
            List<LoanApplication> applications;
            if (status != null && !status.isEmpty()) {
                switch (status.toUpperCase()) {
                    case "PENDING":
                        applications = loanApplicationService.getAllPending();
                        break;
                    case "APPROVED":
                        applications = loanApplicationService.getAllApproved();
                        break;
                    case "REJECTED":
                        applications = loanApplicationService.getAllRejected();
                        break;
                    default:
                        applications = loanApplicationService.getAllPending();
                }
            } else {
                applications = loanApplicationService.getAllPending();
            }
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch applications"));
        }
    }

    // ==================== GET SINGLE APPLICATION ====================

    /**
     * GET /api/admin/loan/applications/{id}
     * Get loan application by ID (full details)
     */
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplication(@PathVariable Long id) {
        try {
            LoanApplication application = loanApplicationService.getApplication(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", application.getId());
            response.put("userId", application.getUser().getId());
            response.put("userFirstName", application.getUser().getFirstName());
            response.put("userLastName", application.getUser().getLastName());
            response.put("userEmail", application.getUser().getEmail());
            response.put("userPhone", application.getUser().getPhone());
            response.put("requestedAmount", application.getRequestedAmount());
            response.put("formattedAmount", application.getMaskedAmount());
            response.put("loanPurpose", application.getLoanPurpose());
            response.put("reason", application.getReason());
            response.put("requestedTermMonths", application.getRequestedTermMonths());
            response.put("employmentStatus", application.getEmploymentStatus());
            response.put("annualIncome", application.getAnnualIncome());
            response.put("employerName", application.getEmployerName());
            response.put("yearsAtEmployer", application.getYearsAtEmployer());
            response.put("existingLoanCount", application.getExistingLoanCount());
            response.put("status", application.getStatus());
            response.put("submittedAt", application.getSubmittedAt());
            response.put("reviewedAt", application.getReviewedAt());
            response.put("reviewedBy", application.getReviewedBy());
            response.put("adminNotes", application.getAdminNotes());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== SEARCH APPLICATIONS ====================

    /**
     * GET /api/admin/loan/applications/search?term=
     * Search loan applications by user name/email
     */

   @GetMapping("/applications/search")
public ResponseEntity<?> searchApplications(@RequestParam String term) {
    try {
        List<LoanApplication> results = loanApplicationService.searchApplications(term);
        
        List<Map<String, Object>> response = results.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("userId", app.getUser().getId());
            map.put("userFirstName", app.getUser().getFirstName());
            map.put("userLastName", app.getUser().getLastName());
            map.put("userEmail", app.getUser().getEmail());
            map.put("requestedAmount", app.getRequestedAmount());
            map.put("loanPurpose", app.getLoanPurpose());
            map.put("status", app.getStatus());
            map.put("submittedAt", app.getSubmittedAt());
            return map;
        }).toList();
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    // ==================== APPROVE APPLICATION ====================

    /**
     * POST /api/admin/loan/applications/{id}/approve
     * Approve loan application
     */
    @PostMapping("/applications/{id}/approve")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long id,
            @RequestParam String adminUsername) {
        try {
            LoanApplication application = loanApplicationService.approveApplication(id, adminUsername);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Loan application approved successfully",
                "applicationId", application.getId(),
                "status", application.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== REJECT APPLICATION ====================

    /**
     * POST /api/admin/loan/applications/{id}/reject
     * Reject loan application with reason
     */
    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long id,
            @RequestParam String adminUsername,
            @RequestParam String reason) {
        try {
            LoanApplication application = loanApplicationService.rejectApplication(id, adminUsername, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Loan application rejected",
                "applicationId", application.getId(),
                "status", application.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== STATISTICS ====================

    /**
     * GET /api/admin/loan/applications/stats
     * Get loan application statistics
     */
    @GetMapping("/applications/stats")
    public ResponseEntity<?> getStatistics() {
        try {
            LoanApplicationService.LoanStatistics stats = loanApplicationService.getStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    // ==================== USER LOAN LIMITS ====================

    /**
     * GET /api/admin/loan/user/{userId}/limits
     * Get user's loan limits and current count
     */
    @GetMapping("/user/{userId}/limits")
    public ResponseEntity<?> getUserLoanLimits(@PathVariable Long userId) {
        try {
            boolean canApply = loanApplicationService.canApplyForLoan(userId);
            int remainingSlots = loanApplicationService.getRemainingLoanSlots(userId);
            int existingLoans = 3 - remainingSlots;

            return ResponseEntity.ok(Map.of(
                "userId", userId,
                "existingLoans", existingLoans,
                "remainingSlots", remainingSlots,
                "maxLoans", 3,
                "canApply", canApply
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN OVERRIDE (EXTEND LIMIT) ====================

    /**
     * POST /api/admin/loan/user/{userId}/extend-limit
     * Admin can extend user's loan limit (future feature)
     */
    @PostMapping("/user/{userId}/extend-limit")
    public ResponseEntity<?> extendLoanLimit(
            @PathVariable Long userId,
            @RequestParam int additionalSlots) {
        try {
            loanApplicationService.increaseMaxLoanLimit(userId, additionalSlots);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Loan limit extended by " + additionalSlots + " slots"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== TEST ENDPOINT ====================

    /**
     * GET /api/admin/loan/test
     * Test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public String test() {
        return "Admin Loan Application Controller is working!";
    }
}

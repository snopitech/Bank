package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.LoanApplication;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.LoanApplicationService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loan")
public class LoanApplicationController {

    @Autowired
    private LoanApplicationService loanApplicationService;

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

    // ==================== SUBMIT LOAN APPLICATION ====================

    /**
     * POST /api/loan/applications
     * Submit a new loan application
     */
    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @RequestHeader("sessionId") String sessionId,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            // Extract fields from request
            Double requestedAmount = null;
            if (request.get("requestedAmount") instanceof Number) {
                requestedAmount = ((Number) request.get("requestedAmount")).doubleValue();
            }

            String loanPurpose = (String) request.get("loanPurpose");
            String reason = (String) request.get("reason");
            Integer requestedTermMonths = (Integer) request.get("requestedTermMonths");
            String employmentStatus = (String) request.get("employmentStatus");
            Double annualIncome = null;
            if (request.get("annualIncome") instanceof Number) {
                annualIncome = ((Number) request.get("annualIncome")).doubleValue();
            }
            String employerName = (String) request.get("employerName");
            Integer yearsAtEmployer = (Integer) request.get("yearsAtEmployer");

            // Validate required fields
            if (requestedAmount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Loan amount is required"));
            }
            if (loanPurpose == null || loanPurpose.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Loan purpose is required"));
            }
            if (requestedTermMonths == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Loan term is required"));
            }

            // Check if user can apply for more loans (max 3)
            if (!loanApplicationService.canApplyForLoan(userId)) {
                int remaining = loanApplicationService.getRemainingLoanSlots(userId);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "You have reached your maximum limit of 3 loans. " +
                            "Please contact a banker for assistance.",
                    "remainingSlots", remaining
                ));
            }

            // Submit application
            LoanApplication application = loanApplicationService.submitApplication(
                userId, requestedAmount, loanPurpose, reason, requestedTermMonths,
                employmentStatus, annualIncome, employerName, yearsAtEmployer
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Loan application submitted successfully");
            response.put("applicationId", application.getId());
            response.put("status", application.getStatus());
            response.put("requestedAmount", application.getRequestedAmount());
            response.put("submittedAt", application.getSubmittedAt());
            response.put("remainingSlots", loanApplicationService.getRemainingLoanSlots(userId) - 1);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // ==================== GET USER APPLICATIONS ====================

    /**
     * GET /api/loan/applications/my-applications
     * Get all loan applications for the logged-in user
     */
    @GetMapping("/applications/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            List<LoanApplication> applications = loanApplicationService.getUserApplications(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("applications", applications);
            response.put("total", applications.size());
            response.put("remainingSlots", loanApplicationService.getRemainingLoanSlots(userId));
            response.put("canApply", loanApplicationService.canApplyForLoan(userId));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GET SINGLE APPLICATION ====================

    /**
     * GET /api/loan/applications/{id}
     * Get a specific loan application by ID
     */
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplication(
            @PathVariable Long id,
            @RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            LoanApplication application = loanApplicationService.getApplication(id);

            // Verify ownership
            if (!application.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this application"));
            }

            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== CHECK ELIGIBILITY ====================

    /**
     * GET /api/loan/eligibility
     * Check if user is eligible for a new loan
     */
    @GetMapping("/eligibility")
    public ResponseEntity<?> checkEligibility(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            Long userId = user.getId();

            boolean canApply = loanApplicationService.canApplyForLoan(userId);
            int remainingSlots = loanApplicationService.getRemainingLoanSlots(userId);
            int existingLoans = 3 - remainingSlots;

            Map<String, Object> response = new HashMap<>();
            response.put("canApply", canApply);
            response.put("remainingSlots", remainingSlots);
            response.put("existingLoans", existingLoans);
            response.put("maxLoans", 3);
            response.put("message", canApply ? 
                "You are eligible to apply for a loan" : 
                "You have reached the maximum number of loans. Please contact a banker.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== LOAN PURPOSES ====================

    /**
     * GET /api/loan/purposes
     * Get list of available loan purposes
     */
    @GetMapping("/purposes")
    public ResponseEntity<List<Map<String, String>>> getLoanPurposes() {
        List<Map<String, String>> purposes = List.of(
            Map.of("code", "HOME", "name", "Home Purchase/Improvement"),
            Map.of("code", "AUTO", "name", "Auto Loan"),
            Map.of("code", "BUSINESS", "name", "Business Loan"),
            Map.of("code", "EDUCATION", "name", "Education"),
            Map.of("code", "PERSONAL", "name", "Personal"),
            Map.of("code", "DEBT_CONSOLIDATION", "name", "Debt Consolidation"),
            Map.of("code", "MEDICAL", "name", "Medical Expenses"),
            Map.of("code", "WEDDING", "name", "Wedding"),
            Map.of("code", "VACATION", "name", "Vacation"),
            Map.of("code", "OTHER", "name", "Other")
        );
        return ResponseEntity.ok(purposes);
    }

    // ==================== LOAN TERMS ====================

    /**
     * GET /api/loan/terms
     * Get available loan terms in months
     */
    @GetMapping("/terms")
    public ResponseEntity<List<Integer>> getLoanTerms() {
        List<Integer> terms = List.of(12, 24, 36, 48, 60, 72, 84, 96, 108, 120);
        return ResponseEntity.ok(terms);
    }
}

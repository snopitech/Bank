package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditIncreaseRequest;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.CreditIncreaseRequestService;
import com.snopitech.snopitechbank.service.CreditIncreaseRequestService.CreditIncreaseRequestDTO;
import com.snopitech.snopitechbank.service.CreditAccountService;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/credit")
public class CreditIncreaseRequestController {
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("CreditIncreaseRequestController is loaded!");
    }

    @Autowired
    private CreditIncreaseRequestService increaseRequestService;

    @Autowired
    private CreditAccountService creditAccountService;

    @SuppressWarnings("unused")
    @Autowired
    private UserService userService;
    
    @SuppressWarnings("unused")
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/admin/test")
    public ResponseEntity<String> adminTest() {
        return ResponseEntity.ok("Admin test endpoint works!");
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Submit a credit limit increase request
     * POST /api/credit/accounts/{accountId}/increase-request?userId={userId}
     */
    @PostMapping("/accounts/{accountId}/increase-request")
    public ResponseEntity<?> submitIncreaseRequest(
            @RequestParam Long userId,
            @PathVariable Long accountId,
            @RequestBody Map<String, Object> request) {
        try {
            // Validate request
            Double requestedLimit = null;
            if (request.get("requestedLimit") instanceof Integer) {
                requestedLimit = ((Integer) request.get("requestedLimit")).doubleValue();
            } else if (request.get("requestedLimit") instanceof Double) {
                requestedLimit = (Double) request.get("requestedLimit");
            }

            String reason = (String) request.get("reason");

            if (requestedLimit == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Requested limit is required"));
            }

            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
            }

            // Verify account belongs to user
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to request increase for this account"));
            }

            // Submit request
            CreditIncreaseRequest increaseRequest = increaseRequestService.submitIncreaseRequest(
                accountId, userId, requestedLimit, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Increase request submitted successfully");
            response.put("requestId", increaseRequest.getId());
            response.put("status", increaseRequest.getStatus());
            response.put("currentLimit", increaseRequest.getCurrentLimit());
            response.put("requestedLimit", increaseRequest.getRequestedLimit());
            response.put("submittedDate", increaseRequest.getSubmittedDate());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all increase requests for a user
     * GET /api/credit/increase-requests/user/{userId}
     */
    @GetMapping("/increase-requests/user/{userId}")
    public ResponseEntity<?> getUserIncreaseRequests(@PathVariable Long userId) {
        try {
            List<CreditIncreaseRequest> requests = increaseRequestService.getUserRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get increase requests for a specific account
     * GET /api/credit/accounts/{accountId}/increase-requests?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/increase-requests")
    public ResponseEntity<?> getAccountIncreaseRequests(
            @RequestParam Long userId,
            @PathVariable Long accountId) {
        try {
            // Verify ownership
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these requests"));
            }

            List<CreditIncreaseRequest> requests = increaseRequestService.getAccountRequests(accountId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get specific increase request by ID
     * GET /api/credit/increase-requests/{id}?userId={userId}
     */
    @GetMapping("/increase-requests/{id}")
    public ResponseEntity<?> getIncreaseRequest(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            CreditIncreaseRequest request = increaseRequestService.getRequest(id);
            
            // Verify ownership
            if (!request.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this request"));
            }
            
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update employment info for a pending request
     * PUT /api/credit/increase-requests/{id}/employment-info?userId={userId}
     */
    @PutMapping("/increase-requests/{id}/employment-info")
    public ResponseEntity<?> updateEmploymentInfo(
            @RequestParam Long userId,
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            // Verify ownership
            CreditIncreaseRequest existingRequest = increaseRequestService.getRequest(id);
            if (!existingRequest.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to update this request"));
            }

            if (!existingRequest.isPending()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Can only update pending requests"));
            }

            String employmentStatus = (String) request.get("employmentStatus");
            Double annualIncome = request.get("annualIncome") != null ? 
                ((Number) request.get("annualIncome")).doubleValue() : null;
            String employerName = (String) request.get("employerName");
            Integer yearsAtEmployer = (Integer) request.get("yearsAtEmployer");

            CreditIncreaseRequest updatedRequest = increaseRequestService.updateEmploymentInfo(
                id, employmentStatus, annualIncome, employerName, yearsAtEmployer);

            return ResponseEntity.ok(Map.of(
                "message", "Employment info updated successfully",
                "request", updatedRequest
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if account has pending increase request
     * GET /api/credit/accounts/{accountId}/has-pending-request?userId={userId}
     */
    @GetMapping("/accounts/{accountId}/has-pending-request")
    public ResponseEntity<?> hasPendingRequest(
            @RequestParam Long userId,
            @PathVariable Long accountId) {
        try {
            // Verify ownership
            CreditAccount account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this account"));
            }

            boolean hasPending = increaseRequestService.hasPendingRequest(accountId);
            return ResponseEntity.ok(Map.of("hasPendingRequest", hasPending));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS (NO SESSION ID) ====================

    /**
     * Get all pending increase requests (admin)
     * GET /api/credit/admin/increase-requests/pending
     */
    @GetMapping("/admin/increase-requests/pending")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<CreditIncreaseRequest> requests = increaseRequestService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get requests pending document verification (admin)
     * GET /api/credit/admin/increase-requests/pending-verification
     */
    @GetMapping("/admin/increase-requests/pending-verification")
    public ResponseEntity<?> getRequestsPendingVerification() {
        try {
            List<CreditIncreaseRequest> requests = 
                increaseRequestService.getRequestsPendingDocumentVerification();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get increase requests with filters (admin)
     * GET /api/credit/admin/increase-requests?status=PENDING&accountId=1
     */
  @GetMapping("/admin/increase-requests")
public ResponseEntity<?> getRequestsWithFilters(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long accountId) {
    try {
        List<CreditIncreaseRequest> requests = 
            increaseRequestService.getRequestsWithFilters(status, accountId);
        List<CreditIncreaseRequestDTO> dtos = increaseRequestService.convertToDTOList(requests);
        return ResponseEntity.ok(dtos);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    /**
     * Get increase request details (admin)
     * GET /api/credit/admin/increase-requests/{id}
     */
    @GetMapping("/admin/increase-requests/{id}")
    public ResponseEntity<?> getRequestAdmin(@PathVariable Long id) {
        try {
            CreditIncreaseRequest request = increaseRequestService.getRequest(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Approve increase request (admin)
     * POST /api/credit/admin/increase-requests/{id}/approve
     */
    @PostMapping("/admin/increase-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        try {
            String adminUsername = "admin@snopitech.com"; // Default admin email

            CreditAccount updatedAccount = increaseRequestService.approveIncreaseRequest(id, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Increase request approved successfully");
            response.put("accountId", updatedAccount.getId());
            response.put("newCreditLimit", updatedAccount.getCreditLimit());
            response.put("increaseCount", updatedAccount.getIncreaseCount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject increase request (admin)
     * POST /api/credit/admin/increase-requests/{id}/reject
     */
    @PostMapping("/admin/increase-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String adminUsername = "admin@snopitech.com"; // Default admin email
            
            String rejectionReason = request.get("rejectionReason");
            String adminNotes = request.get("adminNotes");
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }

            CreditIncreaseRequest rejectedRequest = increaseRequestService.rejectIncreaseRequest(
                id, adminUsername, rejectionReason, adminNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Increase request rejected successfully");
            response.put("requestId", rejectedRequest.getId());
            response.put("status", rejectedRequest.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update credit check info (admin)
     * POST /api/credit/admin/increase-requests/{id}/credit-check
     */
    @PostMapping("/admin/increase-requests/{id}/credit-check")
    public ResponseEntity<?> updateCreditCheckInfo(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Integer creditScore = (Integer) request.get("creditScore");
            Boolean creditCheckPerformed = (Boolean) request.get("creditCheckPerformed");

            CreditIncreaseRequest updatedRequest = increaseRequestService.updateCreditCheckInfo(
                id, creditScore, creditCheckPerformed);
            
            return ResponseEntity.ok(Map.of(
                "message", "Credit check info updated successfully",
                "request", updatedRequest
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify documents (admin)
     * POST /api/credit/admin/increase-requests/{id}/verify-documents
     */
    @PostMapping("/admin/increase-requests/{id}/verify-documents")
    public ResponseEntity<?> verifyDocuments(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Boolean verified = (Boolean) request.get("verified");
            String documentPath = (String) request.get("documentPath");

            if (verified == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Verified flag is required"));
            }

            CreditIncreaseRequest updatedRequest = increaseRequestService.verifyDocuments(
                id, verified, documentPath);
            
            return ResponseEntity.ok(Map.of(
                "message", verified ? "Documents verified successfully" : "Documents marked as unverified",
                "request", updatedRequest
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get increase request statistics (admin)
     * GET /api/credit/admin/increase-requests/statistics
     */
    @GetMapping("/admin/increase-requests/statistics")
    public ResponseEntity<?> getRequestStatistics() {
        try {
            CreditIncreaseRequestService.IncreaseRequestStatistics stats = 
                increaseRequestService.getRequestStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk approve/reject increase requests (admin)
     * POST /api/credit/admin/increase-requests/bulk-action
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/admin/increase-requests/bulk-action")
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> request) {
        try {
            String adminUsername = "admin@snopitech.com"; // Default admin email
            
            List<Long> requestIds = (List<Long>) request.get("requestIds");
            String action = (String) request.get("action");
            String reason = (String) request.get("reason");
            
            if (requestIds == null || requestIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request IDs are required"));
            }
            
            Map<String, Object> results = new HashMap<>();
            int success = 0;
            int failed = 0;
            
            for (Long id : requestIds) {
                try {
                    if ("approve".equalsIgnoreCase(action)) {
                        increaseRequestService.approveIncreaseRequest(id, adminUsername);
                    } else if ("reject".equalsIgnoreCase(action)) {
                        increaseRequestService.rejectIncreaseRequest(id, adminUsername, reason, null);
                    } else {
                        throw new RuntimeException("Invalid action: " + action);
                    }
                    success++;
                } catch (Exception e) {
                    failed++;
                }
            }
            
            results.put("success", success);
            results.put("failed", failed);
            results.put("message", success + " requests processed, " + failed + " failed");
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.BusinessAccountDTO;
import com.snopitech.snopitechbank.service.BusinessAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/business")
public class BusinessAccountAdminController {

    private final BusinessAccountService businessAccountService;

    public BusinessAccountAdminController(BusinessAccountService businessAccountService) {
        this.businessAccountService = businessAccountService;
    }

    /**
     * Get all business account applications (with optional status filter)
     */
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(@RequestParam(required = false) String status) {
        try {
            List<BusinessAccountDTO> applications = businessAccountService.getApplications(status);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get application details by ID
     */
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        try {
            BusinessAccountDTO application = businessAccountService.getApplicationById(id);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

   /**
 * Approve business account application
 */
@PostMapping("/applications/{id}/approve")
public ResponseEntity<?> approveApplication(@PathVariable Long id) {
    try {
        // You can get the admin username from security context
        String approvedBy = "admin"; // TODO: Get from security context
        
        BusinessAccountDTO application = businessAccountService.approveApplication(id, approvedBy);
        return ResponseEntity.ok(Map.of(
            "message", "Business account approved successfully",
            "application", application
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
/**
 * Reject business account application
 */
@PostMapping("/applications/{id}/reject")
public ResponseEntity<?> rejectApplication(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {
    try {
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
        }
        
        // You can get the admin username from security context
        String rejectedBy = "admin"; // TODO: Get from security context
        
        BusinessAccountDTO application = businessAccountService.rejectApplication(id, reason, rejectedBy);
        return ResponseEntity.ok(Map.of(
            "message", "Business account rejected",
            "application", application
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    /**
     * Get application statistics
     */
    @GetMapping("/applications/stats")
    public ResponseEntity<?> getApplicationStats() {
        try {
            Map<String, Long> stats = businessAccountService.getApplicationStats();
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public String test() {
        return "Business Admin Controller is working!";
    }
}
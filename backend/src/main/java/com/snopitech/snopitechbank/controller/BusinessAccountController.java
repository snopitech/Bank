package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.BusinessAccountDTO;
import com.snopitech.snopitechbank.dto.OpenBusinessAccountRequest;
import com.snopitech.snopitechbank.service.BusinessAccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/business/accounts")
public class BusinessAccountController {

    @Autowired
    private BusinessAccountService businessAccountService;

    // ==================== SUBMIT BUSINESS ACCOUNT APPLICATION ====================

    /**
     * POST /api/business/accounts/open - Submit a new business account application
     */
    @PostMapping("/open")
    public ResponseEntity<?> submitApplication(@Valid @RequestBody OpenBusinessAccountRequest request) {
        try {
            BusinessAccountDTO application = businessAccountService.submitApplication(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business account application submitted successfully. A banker will review your application.");
            response.put("application", application);
            response.put("status", "PENDING");
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== GET BUSINESS ACCOUNTS / APPLICATIONS ====================

    /**
     * GET /api/business/accounts/{accountId} - Get business account/application by ID
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<?> getBusinessAccountById(@PathVariable Long accountId) {
        try {
            BusinessAccountDTO account = businessAccountService.getBusinessAccountById(accountId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    /**
     * GET /api/business/accounts/user/{userId} - Get all business accounts/applications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBusinessAccountsByUser(@PathVariable Long userId) {
        try {
            List<BusinessAccountDTO> accounts = businessAccountService.getBusinessAccountsByUser(userId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    /**
     * GET /api/business/accounts/by-account/{accountId} - Get business account by linked account ID
     * (Only works for approved accounts)
     */
    @GetMapping("/by-account/{accountId}")
    public ResponseEntity<?> getBusinessAccountByAccountId(@PathVariable Long accountId) {
        try {
            BusinessAccountDTO account = businessAccountService.getBusinessAccountByAccountId(accountId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== UPDATE BUSINESS ACCOUNT APPLICATION ====================

    /**
     * PUT /api/business/accounts/{accountId}/update - Update business account application
     * (Only allowed for pending applications)
     */
    @PutMapping("/{accountId}/update")
    public ResponseEntity<?> updateBusinessAccount(
            @PathVariable Long accountId,
            @Valid @RequestBody OpenBusinessAccountRequest request) {
        try {
            BusinessAccountDTO updatedAccount = businessAccountService.updateBusinessAccount(accountId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Application updated successfully");
            response.put("application", updatedAccount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== CLOSE BUSINESS ACCOUNT ====================

    /**
     * POST /api/business/accounts/{accountId}/close - Close a business account
     * (Only works for approved accounts)
     */
  @PostMapping("/{accountId}/close")
public ResponseEntity<?> closeBusinessAccount(
        @PathVariable Long accountId,
        @RequestBody Map<String, String> request) {  // <-- Changed to @RequestBody
    try {
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            reason = "Customer request";
        }
        BusinessAccountDTO closedAccount = businessAccountService.closeBusinessAccount(accountId, reason);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Business account closed successfully");
        response.put("account", closedAccount);
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage(),
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
}

    // ==================== NEW: DISABLE/ENABLE BUSINESS ACCOUNT ====================

    /**
     * POST /api/business/accounts/{accountId}/disable - Disable a business account (temporary freeze)
     */
    @PostMapping("/{accountId}/disable")
    public ResponseEntity<?> disableBusinessAccount(
            @PathVariable Long accountId,
            @RequestParam String reason) {
        try {
            BusinessAccountDTO disabledAccount = businessAccountService.disableBusinessAccount(accountId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business account disabled successfully");
            response.put("account", disabledAccount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    /**
     * POST /api/business/accounts/{accountId}/enable - Enable a previously disabled business account
     */
    @PostMapping("/{accountId}/enable")
    public ResponseEntity<?> enableBusinessAccount(@PathVariable Long accountId) {
        try {
            BusinessAccountDTO enabledAccount = businessAccountService.enableBusinessAccount(accountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business account enabled successfully");
            response.put("account", enabledAccount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== CHECK EIN AVAILABILITY ====================

    /**
     * GET /api/business/accounts/check-ein - Check if EIN is already registered
     */
    @GetMapping("/check-ein")
    public ResponseEntity<?> checkEinAvailability(@RequestParam String ein) {
        try {
            // Call service method to check EIN availability
            boolean available = businessAccountService.isEinAvailable(ein);
            
            Map<String, Object> response = new HashMap<>();
            response.put("ein", ein);
            response.put("available", available);
            response.put("message", available ? "EIN is available" : "EIN is already registered");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== DELETE BUSINESS ACCOUNT (PERMANENT) ====================

    /**
     * DELETE /api/business/accounts/{accountId} - Permanently delete a business account
     * (Admin only - careful with this!)
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> deleteBusinessAccount(@PathVariable Long accountId) {
        try {
            businessAccountService.deleteBusinessAccount(accountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business account permanently deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== CARD MANAGEMENT ====================

    /**
     * POST /api/business/accounts/{accountId}/cards/virtual - Generate additional virtual card
     */
    @PostMapping("/{accountId}/cards/virtual")
    public ResponseEntity<?> generateAdditionalVirtualCard(@PathVariable Long accountId) {
        try {
            var card = businessAccountService.generateAdditionalVirtualCard(accountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Virtual card generated successfully");
            response.put("card", card);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    /**
     * GET /api/business/accounts/{accountId}/cards - Get all cards for a business account
     */
    @GetMapping("/{accountId}/cards")
    public ResponseEntity<?> getBusinessAccountCards(@PathVariable Long accountId) {
        try {
            var cards = businessAccountService.getBusinessAccountCards(accountId);
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    /**
     * PUT /api/business/accounts/{accountId}/cards/{cardId}/primary - Set primary card
     */
    @PutMapping("/{accountId}/cards/{cardId}/primary")
    public ResponseEntity<?> setPrimaryCard(
            @PathVariable Long accountId,
            @PathVariable Long cardId) {
        try {
            businessAccountService.setPrimaryCard(accountId, cardId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Primary card updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // ==================== BUSINESS TYPES AND INDUSTRIES ====================

    /**
     * GET /api/business/accounts/types - Get list of business types
     */
    @GetMapping("/types")
    public ResponseEntity<List<Map<String, String>>> getBusinessTypes() {
        List<Map<String, String>> businessTypes = List.of(
            Map.of("code", "SOLE_PROPRIETORSHIP", "name", "Sole Proprietorship"),
            Map.of("code", "LLC", "name", "Limited Liability Company (LLC)"),
            Map.of("code", "CORPORATION", "name", "Corporation"),
            Map.of("code", "PARTNERSHIP", "name", "Partnership"),
            Map.of("code", "NONPROFIT", "name", "Non-Profit Organization")
        );
        return ResponseEntity.ok(businessTypes);
    }

    /**
     * GET /api/business/accounts/industries - Get list of industries
     */
    @GetMapping("/industries")
    public ResponseEntity<List<Map<String, String>>> getIndustries() {
        List<Map<String, String>> industries = List.of(
            Map.of("code", "RETAIL", "name", "Retail"),
            Map.of("code", "TECHNOLOGY", "name", "Technology"),
            Map.of("code", "HEALTHCARE", "name", "Healthcare"),
            Map.of("code", "CONSTRUCTION", "name", "Construction"),
            Map.of("code", "MANUFACTURING", "name", "Manufacturing"),
            Map.of("code", "HOSPITALITY", "name", "Hospitality"),
            Map.of("code", "REAL_ESTATE", "name", "Real Estate"),
            Map.of("code", "FINANCIAL", "name", "Financial Services"),
            Map.of("code", "CONSULTING", "name", "Consulting"),
            Map.of("code", "EDUCATION", "name", "Education")
        );
        return ResponseEntity.ok(industries);
    }
}
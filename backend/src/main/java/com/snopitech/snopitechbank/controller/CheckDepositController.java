package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import com.snopitech.snopitechbank.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/checks")
public class CheckDepositController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CheckDepositRepository checkDepositRepository;

    @Autowired
    private ImageStorageService imageStorageService;

  /**
 * POST /api/checks/deposit
 * Submit a new check deposit
 */
@PostMapping("/deposit")
public ResponseEntity<?> depositCheck(
        @RequestParam("userId") Long userId,
        @RequestParam("accountId") Long accountId,
        @RequestParam("amount") Double amount,
        @RequestParam("checkNumber") String checkNumber,
        @RequestParam("routingNumber") String routingNumber,
        @RequestParam("accountNumber") String accountNumber,
        @RequestParam("payeeName") String payeeName,
        @RequestParam("checkDate") String checkDateStr,
        @RequestParam("frontImage") MultipartFile frontImage,
        @RequestParam(value = "backImage", required = false) MultipartFile backImage) {
    
    try {
        System.out.println("========== CHECK DEPOSIT SUBMISSION ==========");
        
        // Validate user and account
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Account does not belong to this user"));
        }
        
        // Validate check date
        LocalDateTime checkDate;
        try {
            checkDate = LocalDateTime.parse(checkDateStr + "T00:00:00");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
        }
        
        // Validate other fields
        if (amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than 0"));
        }
        if (checkNumber == null || checkNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Check number is required"));
        }
        if (routingNumber == null || routingNumber.length() != 9) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid 9-digit routing number is required"));
        }
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Account number is required"));
        }
        if (payeeName == null || payeeName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payee name is required"));
        }
        
        // Create check deposit record with temporary paths
CheckDeposit checkDeposit = new CheckDeposit();
checkDeposit.setUser(user);
checkDeposit.setAccount(account);
checkDeposit.setAmount(amount);
checkDeposit.setCheckNumber(checkNumber);
checkDeposit.setRoutingNumber(routingNumber);
checkDeposit.setAccountNumber(accountNumber);
checkDeposit.setPayeeName(payeeName);
checkDeposit.setCheckDate(checkDate);
checkDeposit.setStatus("PENDING");
checkDeposit.setSubmittedAt(LocalDateTime.now());

// Set temporary placeholder to avoid null constraint
String tempPlaceholder = "temp_" + System.currentTimeMillis();
checkDeposit.setFrontImagePath(tempPlaceholder);
checkDeposit.setBackImagePath(tempPlaceholder);

// Save to get ID
CheckDeposit savedCheck = checkDepositRepository.save(checkDeposit);
System.out.println("Check deposit saved with ID: " + savedCheck.getId());
        
        // Now save images using the check ID
        String frontImagePath = imageStorageService.storeImage(
            frontImage, 
            userId.toString(), 
            savedCheck.getId().toString(), 
            "front"
        );
        System.out.println("Front image saved: " + frontImagePath);
        
        String backImagePath = null;
        if (backImage != null && !backImage.isEmpty()) {
            backImagePath = imageStorageService.storeImage(
                backImage, 
                userId.toString(), 
                savedCheck.getId().toString(), 
                "back"
            );
            System.out.println("Back image saved: " + backImagePath);
        }
        
        // Update check with image paths
        savedCheck.setFrontImagePath(frontImagePath);
        savedCheck.setBackImagePath(backImagePath);
        checkDepositRepository.save(savedCheck);
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Check deposit submitted successfully. It will be reviewed by our team.");
        response.put("checkId", savedCheck.getId());
        response.put("status", "PENDING");
        response.put("submittedAt", savedCheck.getSubmittedAt());
        
        System.out.println("==========================================");
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        System.out.println("ERROR submitting check: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
    /**
     * GET /api/checks/user/{userId}
     * Get all checks for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserChecks(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<CheckDeposit> userChecks = checkDepositRepository.findByUserOrderBySubmittedAtDesc(user);
            
            List<Map<String, Object>> response = userChecks.stream().map(check -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", check.getId());
                map.put("amount", check.getAmount());
                map.put("checkNumber", check.getCheckNumber());
                map.put("payeeName", check.getPayeeName());
                map.put("submittedAt", check.getSubmittedAt());
                map.put("status", check.getStatus());
                map.put("rejectionReason", check.getRejectionReason());
                map.put("reviewedAt", check.getReviewedAt());
                
                // Add image paths for viewing
                map.put("frontImagePath", check.getFrontImagePath());
                map.put("backImagePath", check.getBackImagePath());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/checks/{id}
     * Get specific check details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCheckDetails(@PathVariable Long id) {
        try {
            CheckDeposit check = checkDepositRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Check not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", check.getId());
            response.put("amount", check.getAmount());
            response.put("checkNumber", check.getCheckNumber());
            response.put("routingNumber", check.getRoutingNumber());
            response.put("accountNumber", "****" + check.getAccountNumber().substring(Math.max(0, check.getAccountNumber().length() - 4)));
            response.put("payeeName", check.getPayeeName());
            response.put("checkDate", check.getCheckDate());
            response.put("submittedAt", check.getSubmittedAt());
            response.put("status", check.getStatus());
            response.put("frontImagePath", check.getFrontImagePath());
            response.put("backImagePath", check.getBackImagePath());
            response.put("rejectionReason", check.getRejectionReason());
            response.put("reviewedAt", check.getReviewedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/checks/stats/user/{userId}
     * Get check statistics for a user
     */
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<CheckDeposit> userChecks = checkDepositRepository.findByUserOrderBySubmittedAtDesc(user);
            
            long pending = userChecks.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
            long approved = userChecks.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();
            long rejected = userChecks.stream().filter(c -> "REJECTED".equals(c.getStatus())).count();
            
            double totalApprovedAmount = userChecks.stream()
                    .filter(c -> "APPROVED".equals(c.getStatus()))
                    .mapToDouble(CheckDeposit::getAmount)
                    .sum();
            
            return ResponseEntity.ok(Map.of(
                "pending", pending,
                "approved", approved,
                "rejected", rejected,
                "total", userChecks.size(),
                "totalApprovedAmount", totalApprovedAmount
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
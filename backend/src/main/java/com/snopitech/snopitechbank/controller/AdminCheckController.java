package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import com.snopitech.snopitechbank.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.snopitech.snopitechbank.service.EmailService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/checks")
public class AdminCheckController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CheckDepositRepository checkDepositRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EmailService emailService;

    @SuppressWarnings("unused")
    @Autowired
    private ImageStorageService imageStorageService;

    /**
     * GET /api/admin/checks/pending
     * Get all pending checks for admin review
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingChecks() {
        try {
            System.out.println("========== PENDING CHECKS ==========");
            
            List<CheckDeposit> pendingChecks = checkDepositRepository.findByStatusOrderBySubmittedAtAsc("PENDING");
            System.out.println("Found " + pendingChecks.size() + " pending checks");
            
            List<Map<String, Object>> response = pendingChecks.stream().map(check -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", check.getId());
                map.put("amount", check.getAmount());
                map.put("checkNumber", check.getCheckNumber());
                map.put("payeeName", check.getPayeeName());
                map.put("submittedAt", check.getSubmittedAt());
                map.put("status", check.getStatus());
                map.put("userName", check.getUser().getFullName());
                map.put("userEmail", check.getUser().getEmail());
                map.put("frontImagePath", check.getFrontImagePath());
                map.put("backImagePath", check.getBackImagePath());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/checks/approved
     * Get all approved checks
     */
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedChecks() {
        try {
            System.out.println("========== APPROVED CHECKS ==========");
            
            List<CheckDeposit> approvedChecks = checkDepositRepository.findByStatusOrderBySubmittedAtDesc("APPROVED");
            System.out.println("Found " + approvedChecks.size() + " approved checks");
            
            List<Map<String, Object>> response = approvedChecks.stream().map(check -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", check.getId());
                map.put("amount", check.getAmount());
                map.put("checkNumber", check.getCheckNumber());
                map.put("payeeName", check.getPayeeName());
                map.put("submittedAt", check.getSubmittedAt());
                map.put("reviewedAt", check.getReviewedAt());
                map.put("status", check.getStatus());
                map.put("userName", check.getUser().getFullName());
                map.put("userEmail", check.getUser().getEmail());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/checks/rejected
     * Get all rejected checks
     */
    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedChecks() {
        try {
            System.out.println("========== REJECTED CHECKS ==========");
            
            List<CheckDeposit> rejectedChecks = checkDepositRepository.findByStatusOrderBySubmittedAtDesc("REJECTED");
            System.out.println("Found " + rejectedChecks.size() + " rejected checks");
            
            List<Map<String, Object>> response = rejectedChecks.stream().map(check -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", check.getId());
                map.put("amount", check.getAmount());
                map.put("checkNumber", check.getCheckNumber());
                map.put("payeeName", check.getPayeeName());
                map.put("submittedAt", check.getSubmittedAt());
                map.put("reviewedAt", check.getReviewedAt());
                map.put("rejectionReason", check.getRejectionReason());
                map.put("status", check.getStatus());
                map.put("userName", check.getUser().getFullName());
                map.put("userEmail", check.getUser().getEmail());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/checks/stats
     * Get check deposit statistics for admin
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            long pendingCount = checkDepositRepository.countByStatus("PENDING");
            long approvedCount = checkDepositRepository.countByStatus("APPROVED");
            long rejectedCount = checkDepositRepository.countByStatus("REJECTED");
            
            return ResponseEntity.ok(Map.of(
                "pending", pendingCount,
                "approved", approvedCount,
                "rejected", rejectedCount,
                "total", pendingCount + approvedCount + rejectedCount
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/checks/{id}
     * Get check details for admin
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
            response.put("accountNumber", check.getAccountNumber());
            response.put("payeeName", check.getPayeeName());
            response.put("checkDate", check.getCheckDate());
            response.put("submittedAt", check.getSubmittedAt());
            response.put("status", check.getStatus());
            response.put("frontImagePath", check.getFrontImagePath());
            response.put("backImagePath", check.getBackImagePath());
            response.put("rejectionReason", check.getRejectionReason());
            response.put("userName", check.getUser().getFullName());
            response.put("userEmail", check.getUser().getEmail());
            response.put("destinationAccountNumber", check.getAccount().getMaskedAccountNumber());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/admin/checks/{id}/approve
     * Approve a check deposit
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveCheck(@PathVariable Long id) {
        try {
            System.out.println("=== APPROVING CHECK ID: " + id + " ===");
            
            CheckDeposit check = checkDepositRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Check not found"));
            
            if (!"PENDING".equals(check.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Check is not pending"));
            }
            
            // Update check status
            check.setStatus("APPROVED");
            check.setReviewedAt(LocalDateTime.now());
            checkDepositRepository.save(check);
            
            // Credit the user's account
            Account account = check.getAccount();
            double previousBalance = account.getBalance();
            account.setBalance(account.getBalance() + check.getAmount());
            accountRepository.save(account);
            
            // Create transaction record
            Transaction transaction = new Transaction();
            transaction.setAccountId(account.getId());
            transaction.setAmount(check.getAmount());
            transaction.setType("CHECK_DEPOSIT");
            transaction.setBalanceAfter(account.getBalance());
            transaction.setTimestamp(LocalDateTime.now());
            transaction.setDescription("Check deposit - Check #" + check.getCheckNumber());
            transaction.setCategory("DEPOSIT");
            transactionRepository.save(transaction);
            
            System.out.println("Check approved, amount $" + check.getAmount() + " added to account " + account.getId());
            
            // Send email notification
            try {
                String subject = "✅ Your check deposit has been approved";
                String message = String.format(
                    "Dear %s,\n\n" +
                    "Your check deposit of $%.2f (Check #%s) has been approved and the funds have been credited to your account.\n\n" +
                    "New balance: $%.2f\n\n" +
                    "Thank you for banking with SnopitechBank!",
                    check.getUser().getFullName(),
                    check.getAmount(),
                    check.getCheckNumber(),
                    account.getBalance()
                );
                
                emailService.sendEmail(check.getUser().getEmail(), subject, message);
                System.out.println("Approval email sent to " + check.getUser().getEmail());
            } catch (Exception e) {
                System.out.println("Failed to send approval email: " + e.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Check approved and funds credited",
                "amount", check.getAmount(),
                "newBalance", account.getBalance(),
                "previousBalance", previousBalance
            ));
            
        } catch (Exception e) {
            System.out.println("ERROR approving check: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/admin/checks/{id}/reject
     * Reject a check deposit
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectCheck(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            System.out.println("=== REJECTING CHECK ID: " + id + " ===");
            
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }
            
            CheckDeposit check = checkDepositRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Check not found"));
            
            if (!"PENDING".equals(check.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Check is not pending"));
            }
            
            // Update check status
            check.setStatus("REJECTED");
            check.setRejectionReason(reason);
            check.setReviewedAt(LocalDateTime.now());
            checkDepositRepository.save(check);
            
            System.out.println("Check rejected, reason: " + reason);
            
            // Send email notification
            try {
                String subject = "❌ Your check deposit has been rejected";
                String message = String.format(
                    "Dear %s,\n\n" +
                    "Your check deposit of $%.2f (Check #%s) has been rejected.\n\n" +
                    "Reason: %s\n\n" +
                    "If you have any questions, please contact our support team.\n\n" +
                    "Thank you for banking with SnopitechBank!",
                    check.getUser().getFullName(),
                    check.getAmount(),
                    check.getCheckNumber(),
                    reason
                );
                
                emailService.sendEmail(check.getUser().getEmail(), subject, message);
                System.out.println("Rejection email sent to " + check.getUser().getEmail());
            } catch (Exception e) {
                System.out.println("Failed to send rejection email: " + e.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Check rejected",
                "reason", reason
            ));
            
        } catch (Exception e) {
            System.out.println("ERROR rejecting check: " + e.getMessage());
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
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

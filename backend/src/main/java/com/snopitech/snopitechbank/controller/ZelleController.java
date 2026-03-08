package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/zelle")
public class ZelleController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ZelleEnrollmentRepository zelleEnrollmentRepository;

    @Autowired
    private ZelleTransferRepository zelleTransferRepository;

    @Autowired
    private ZelleContactRepository zelleContactRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Helper method to get user from sessionId
    private User getUserFromSession(String sessionId) {
        return userRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

  /**
 * GET /api/zelle/enrollment
 * Get Zelle enrollment status for logged-in user
 */
@GetMapping("/enrollment")
public ResponseEntity<?> getEnrollment(@RequestHeader("sessionId") String sessionId) {
    try {
        System.out.println("=== ZELLE ENROLLMENT DEBUG ===");
        System.out.println("Received sessionId: " + sessionId);
        
        if (sessionId == null || sessionId.isEmpty()) {
            System.out.println("ERROR: SessionId is null or empty");
            return ResponseEntity.badRequest().body(Map.of("error", "Session ID is required"));
        }
        
        User user = getUserFromSession(sessionId);
        if (user == null) {
            System.out.println("ERROR: User not found for sessionId: " + sessionId);
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        System.out.println("Found user: " + user.getId() + " - " + user.getEmail());
        
        ZelleEnrollment enrollment = zelleEnrollmentRepository
                .findByUserAndActiveTrue(user)
                .orElse(null);
        
        if (enrollment == null) {
            System.out.println("User not enrolled in Zelle");
            return ResponseEntity.ok(Map.of(
                "enrolled", false,
                "message", "Not enrolled in Zelle"
            ));
        }
        
        System.out.println("User is enrolled. Enrollment ID: " + enrollment.getId());
        
        // Get account safely
        Account account = enrollment.getAccount();
        if (account == null) {
            System.out.println("ERROR: Enrollment has no associated account");
            return ResponseEntity.badRequest().body(Map.of("error", "Enrollment has no account"));
        }
        
        return ResponseEntity.ok(Map.of(
            "enrolled", true,
            "email", enrollment.getEmail() != null ? enrollment.getEmail() : "",
            "phone", enrollment.getPhone() != null ? enrollment.getPhone() : "",
            "fullName", enrollment.getFullName() != null ? enrollment.getFullName() : "",
            "accountId", account.getId(),
            "accountNumber", account.getMaskedAccountNumber() != null ? account.getMaskedAccountNumber() : "",
            "enrolledAt", enrollment.getEnrolledAt() != null ? enrollment.getEnrolledAt().toString() : ""
        ));
        
    } catch (Exception e) {
        System.out.println("ERROR in getEnrollment: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Failed to get enrollment status: " + e.getMessage()
        ));
    }
}

    /**
     * POST /api/zelle/enroll
     * Enroll in Zelle with email/phone
     */
    @PostMapping("/enroll")
    public ResponseEntity<?> enrollInZelle(
            @RequestHeader("sessionId") String sessionId,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromSession(sessionId);
            
            String email = (String) request.get("email");
            String phone = (String) request.get("phone");
            Long accountId = ((Number) request.get("accountId")).longValue();
            
            if (email == null && phone == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email or phone is required"));
            }
            
            // Check if already enrolled
            if (zelleEnrollmentRepository.findByUserAndActiveTrue(user).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already enrolled in Zelle"));
            }
            
            // Check if email already used
            if (email != null && zelleEnrollmentRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered with Zelle"));
            }
            
            // Check if phone already used
            if (phone != null && zelleEnrollmentRepository.existsByPhone(phone)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone already registered with Zelle"));
            }
            
            // Get account
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            
            // Verify account belongs to user
            if (!account.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Account does not belong to user"));
            }
            
            // Create enrollment
            ZelleEnrollment enrollment = new ZelleEnrollment(
                user,
                account,
                email,
                phone,
                user.getFullName()
            );
            
            zelleEnrollmentRepository.save(enrollment);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully enrolled in Zelle",
                "email", email,
                "phone", phone
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/zelle/contacts
     * Get recent Zelle contacts
     */
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            
            List<ZelleContact> contacts = zelleContactRepository
                    .findByUserOrderByTransferCountDescLastUsedDesc(user);
            
            List<Map<String, Object>> response = contacts.stream().map(contact -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", contact.getId());
                map.put("name", contact.getContactName());
                map.put("email", contact.getContactEmail());
                map.put("phone", contact.getContactPhone());
                map.put("transferCount", contact.getTransferCount());
                map.put("lastUsed", contact.getLastUsed());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

           /**
 * POST /api/zelle/send
 * Send money via Zelle
 */
@SuppressWarnings("null")
@PostMapping("/send")
public ResponseEntity<?> sendMoney(
        @RequestHeader("sessionId") String sessionId,
        @RequestBody Map<String, Object> request) {
    try {
        User user = getUserFromSession(sessionId);
        
        Double amount = ((Number) request.get("amount")).doubleValue();
        Long fromAccountId = ((Number) request.get("fromAccountId")).longValue();
        String recipientEmail = (String) request.get("recipientEmail");
        String recipientPhone = (String) request.get("recipientPhone");
        String recipientName = (String) request.get("recipientName");
        
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));
        }
        
        if (recipientEmail == null && recipientPhone == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient email or phone required"));
        }
        
        // Get source account
        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        // Verify account belongs to user
        if (!fromAccount.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Account does not belong to user"));
        }
        
        // Check sufficient funds
        if (fromAccount.getBalance() < amount) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds"));
        }
        
        // Process transfer - debit from source account
        fromAccount.setBalance(fromAccount.getBalance() - amount);
        accountRepository.save(fromAccount);
        
        // Create transaction record for source account (money leaving)
        Transaction sourceTransaction = new Transaction();
        sourceTransaction.setAccountId(fromAccount.getId());
        sourceTransaction.setAmount(amount);
        sourceTransaction.setType("ZELLE_OUT");
        sourceTransaction.setBalanceAfter(fromAccount.getBalance());
        sourceTransaction.setTimestamp(LocalDateTime.now());
        sourceTransaction.setDescription("Zelle transfer to " + 
            (recipientName != null ? recipientName : 
            (recipientEmail != null ? recipientEmail : recipientPhone)));
        sourceTransaction.setCategory("ZELLE");
        transactionRepository.save(sourceTransaction);
        
        // Look for recipient in our system (by email or phone)
        Account recipientAccount = null;
        User recipientUser = null;
        
        if (recipientEmail != null) {
            recipientUser = userRepository.findByEmail(recipientEmail);
        } else if (recipientPhone != null) {
            // This assumes you have a method to find by phone
            recipientUser = userRepository.findByPhone(recipientPhone).orElse(null);
        }
        
        // If recipient found in our system, credit their account
        if (recipientUser != null) {
            // Get their first checking account
            List<Account> recipientAccounts = accountRepository.findByUserId(recipientUser.getId());
            recipientAccount = recipientAccounts.stream()
                    .filter(acc -> "CHECKING".equals(acc.getAccountType()))
                    .findFirst()
                    .orElse(null);
            
            if (recipientAccount != null) {
                // Credit recipient account
                recipientAccount.setBalance(recipientAccount.getBalance() + amount);
                accountRepository.save(recipientAccount);
                
                // Create transaction record for recipient (money arriving)
                Transaction recipientTransaction = new Transaction();
                recipientTransaction.setAccountId(recipientAccount.getId());
                recipientTransaction.setAmount(amount);
                recipientTransaction.setType("ZELLE_IN");
                recipientTransaction.setBalanceAfter(recipientAccount.getBalance());
                recipientTransaction.setTimestamp(LocalDateTime.now());
                recipientTransaction.setDescription("Zelle transfer from " + user.getFullName());
                recipientTransaction.setCategory("ZELLE");
                transactionRepository.save(recipientTransaction);
                
                System.out.println("Recipient found: " + recipientUser.getEmail() + " - Credited $" + amount);
            }
        } else {
            System.out.println("Recipient not found in system - external Zelle transfer to: " + 
                (recipientEmail != null ? recipientEmail : recipientPhone));
        }
        
        // Create Zelle transfer record
        ZelleTransfer transfer = new ZelleTransfer();
        transfer.setFromUser(user);
        transfer.setFromAccount(fromAccount);
        transfer.setRecipientEmail(recipientEmail);
        transfer.setRecipientPhone(recipientPhone);
        transfer.setRecipientName(recipientName);
        transfer.setAmount(amount);
        transfer.setStatus("COMPLETED");
        transfer.setReference("ZL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transfer.setDescription("Zelle transfer");
        transfer.setCompletedAt(LocalDateTime.now());
        zelleTransferRepository.save(transfer);
        
        // Update or create contact for sender
        if (recipientEmail != null || recipientPhone != null) {
            ZelleContact contact = null;
            
            if (recipientEmail != null) {
                contact = zelleContactRepository
                        .findByUserAndContactEmail(user, recipientEmail)
                        .orElse(null);
            } else if (recipientPhone != null) {
                contact = zelleContactRepository
                        .findByUserAndContactPhone(user, recipientPhone)
                        .orElse(null);
            }
            
            if (contact == null) {
                contact = new ZelleContact();
                contact.setUser(user);
                contact.setContactName(recipientName != null ? recipientName : 
                    (recipientEmail != null ? recipientEmail : recipientPhone));
                contact.setContactEmail(recipientEmail);
                contact.setContactPhone(recipientPhone);
                contact.setTransferCount(1);
            } else {
                contact.setTransferCount(contact.getTransferCount() + 1);
            }
            
            contact.setLastUsed(LocalDateTime.now());
            zelleContactRepository.save(contact);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Zelle transfer successful");
        response.put("reference", transfer.getReference());
        response.put("newBalance", fromAccount.getBalance());
        response.put("amount", amount);
        response.put("recipient", recipientName != null ? recipientName : 
            (recipientEmail != null ? recipientEmail : recipientPhone));
        
        if (recipientAccount != null) {
            response.put("recipientFound", true);
            response.put("recipientName", recipientUser.getFullName());
        } else {
            response.put("recipientFound", false);
            response.put("recipientNote", "External transfer - recipient not in system");
        }
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    /**
     * GET /api/zelle/transfers
     * Get Zelle transfer history
     */
    @GetMapping("/transfers")
    public ResponseEntity<?> getTransferHistory(@RequestHeader("sessionId") String sessionId) {
        try {
            User user = getUserFromSession(sessionId);
            
            List<ZelleTransfer> transfers = zelleTransferRepository
                    .findByFromUserOrderByCreatedAtDesc(user);
            
            List<Map<String, Object>> response = transfers.stream().map(transfer -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", transfer.getId());
                map.put("reference", transfer.getReference());
                map.put("recipient", transfer.getRecipientName() != null ? transfer.getRecipientName() :
                    (transfer.getRecipientEmail() != null ? transfer.getRecipientEmail() : transfer.getRecipientPhone()));
                map.put("amount", transfer.getAmount());
                map.put("status", transfer.getStatus());
                map.put("date", transfer.getCreatedAt());
                map.put("completedAt", transfer.getCompletedAt());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

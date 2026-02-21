package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.SafeProfileUpdateDTO;
import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.dto.UpdateUserProfileDTO;
import com.snopitech.snopitechbank.service.UserService;
import com.snopitech.snopitechbank.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ⭐ ADD THESE IMPORTS FOR SECURITY QUESTIONS
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final TransactionService transactionService;

    public UserController(UserService userService, TransactionService transactionService) {
        this.userService = userService;
        this.transactionService = transactionService;
    }

    // ⭐ GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ⭐ GET USER BY ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // ⭐ CREATE USER
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // ⭐ DELETE USER
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // ⭐ UPDATE PROFILE (ORIGINAL - includes email updates)
    @PutMapping("/{userId}/update-profile")
    public User updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateUserProfileDTO dto
    ) {
        return userService.updateUserProfile(userId, dto);
    }

    // ⭐ SAFE PROFILE UPDATE (FIXED - accepts direct DTO)
    @PutMapping("/{userId}/update-profile-safe")
    public User updateProfileSafe(
            @PathVariable Long userId,
            @RequestBody SafeProfileUpdateDTO dto
    ) {
        return userService.updateUserProfileSafe(userId, dto);
    }

    // ⭐ UPDATE SECURITY QUESTIONS (FIXED - accepts array directly)
    @PutMapping("/{userId}/security-questions")
    public ResponseEntity<?> updateSecurityQuestions(
            @PathVariable Long userId,
            @RequestBody List<Map<String, String>> securityQuestionsList) {
        
        try {
            if (securityQuestionsList == null || securityQuestionsList.isEmpty()) {
                return ResponseEntity.badRequest().body("Security questions cannot be empty");
            }
            
            ObjectMapper objectMapper = new ObjectMapper();
            String securityQuestionsJson = objectMapper.writeValueAsString(securityQuestionsList);
            
            User user = userService.updateSecurityQuestions(userId, securityQuestionsJson);
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error updating security questions: " + e.getMessage());
        }
    }

    // ⭐ GET SECURITY QUESTIONS (FIXED - returns array)
    @GetMapping("/{userId}/security-questions")
    public ResponseEntity<?> getSecurityQuestions(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            String securityQuestions = user.getSecurityQuestions();
            
            if (securityQuestions == null || securityQuestions.trim().isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, String>> questions = objectMapper.readValue(
                securityQuestions, 
                new TypeReference<List<Map<String, String>>>() {}
            );
            
            return ResponseEntity.ok(questions);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error retrieving security questions: " + e.getMessage()));
        }
    }

    // ⭐ COMPLETE PROFILE
    @PutMapping("/{userId}/complete-profile")
    public ResponseEntity<?> completeProfile(@PathVariable Long userId) {
        try {
            User user = userService.completeUserProfile(userId);
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error completing profile: " + e.getMessage());
        }
    }

    // ⭐ GET USER BY ACCOUNT NUMBER
    @GetMapping("/lookup")
    public ResponseEntity<?> getUserByAccountNumber(@RequestParam String accountNumber) {
        try {
            User user = userService.getUserByAccountNumber(accountNumber);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error looking up user: " + e.getMessage()));
        }
    }

    // ⭐ GET USER TRANSACTIONS
    @GetMapping("/{userId}/transactions")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", "User not found with ID: " + userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error fetching transactions: " + e.getMessage()));
        }
    }
}
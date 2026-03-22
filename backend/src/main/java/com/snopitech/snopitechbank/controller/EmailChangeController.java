package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.service.EmailChangeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/email-change")
public class EmailChangeController {

    private final EmailChangeService emailChangeService;

    public EmailChangeController(EmailChangeService emailChangeService) {
        this.emailChangeService = emailChangeService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestEmailChange(@RequestBody Map<String, String> request) {
        try {
            String currentEmail = request.get("currentEmail");
            String newEmail = request.get("newEmail");
            
            if (currentEmail == null || newEmail == null) {
                return ResponseEntity.badRequest().body("Both currentEmail and newEmail are required");
            }
            
            emailChangeService.requestEmailChange(currentEmail, newEmail);
            return ResponseEntity.ok().body("Verification link sent to your current email");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing email change request");
        }
    }

    @GetMapping("/verify/{token}")
    public ResponseEntity<?> verifyEmailChangeToken(@PathVariable String token) {
        try {

           boolean isValid = emailChangeService.verifyEmailChangeToken(token);
           if (isValid) {
           return ResponseEntity.ok().body("Token is valid");
           } else {
           return ResponseEntity.badRequest().body("Invalid token");
           }
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error verifying token");
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmEmailChange(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newEmail = request.get("newEmail");
            
            if (token == null || newEmail == null) {
                return ResponseEntity.badRequest().body("Both token and newEmail are required");
            }
            
            emailChangeService.confirmEmailChange(token, newEmail);
            return ResponseEntity.ok().body("Email updated successfully");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error confirming email change");
        }
    }
}

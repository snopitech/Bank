package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailChangeServiceImpl implements EmailChangeService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();
    
    // Store pending email changes (token -> newEmail)
    private final Map<String, String> pendingEmailChanges = new HashMap<>();
    
    // Token expiry time in hours
    private static final int TOKEN_EXPIRY_HOURS = 1;
    
    public EmailChangeServiceImpl(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void requestEmailChange(String currentEmail, String newEmail) {
        // Find user by current email
        User user = userRepository.findByEmail(currentEmail);
        
        if (user == null) {
            throw new IllegalArgumentException("No user found with email: " + currentEmail);
        }
        
        // Check if new email is already in use
        User existingUserWithNewEmail = userRepository.findByEmail(newEmail);
        if (existingUserWithNewEmail != null) {
            throw new IllegalArgumentException("Email " + newEmail + " is already in use");
        }
        
        // Generate secure token
        String token = generateSecureToken();
        
        // Store pending email change (token -> newEmail)
        pendingEmailChanges.put(token, newEmail);
        
        // Store token in user entity (similar to resetToken)
        user.setResetToken(token); // Reusing resetToken field for email change
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
        
        // Save user with token
        userRepository.save(user);
        
        // Build verification link (frontend URL)
        String verificationLink = "http://localhost:5173/verify-email-change?token=" + token;
        
        // Send email using the existing method
        emailService.sendEmailChangeVerification(
            user.getEmail(), 
            user.getFullName(), 
            verificationLink, 
            newEmail
        );
    }

    @Override
    public boolean verifyEmailChangeToken(String token) {
        // Check if token exists in pending changes
        if (!pendingEmailChanges.containsKey(token)) {
            throw new IllegalArgumentException("Invalid or expired email change token");
        }
        
        // Find user by token (using resetToken field)
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired email change token"));
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            // Clear expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            pendingEmailChanges.remove(token);
            throw new IllegalArgumentException("Email change token has expired");
        }
        
        return true;
    }

    @Override
    @Transactional
    public void confirmEmailChange(String token, String newEmail) {
        // Verify token first
        verifyEmailChangeToken(token);
        
        // Verify new email matches the one stored
        String storedNewEmail = pendingEmailChanges.get(token);
        if (!newEmail.equals(storedNewEmail)) {
            throw new IllegalArgumentException("New email does not match the original request");
        }
        
        // Find user by token
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email change token"));
        
        // Update email
        user.setEmail(newEmail);
        
        // Clear reset token (one-time use)
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        // Save user with new email
        userRepository.save(user);
        
        // Remove from pending changes
        pendingEmailChanges.remove(token);
    }
    
    /**
     * Generate a secure random token (64 characters)
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[48]; // 48 bytes = 64 chars in Base64
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes).replace("=", ""); // Remove padding
    }
}
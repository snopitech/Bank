package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();
    
    // Token expiry time in hours
    private static final int TOKEN_EXPIRY_HOURS = 1;
    
    public PasswordResetServiceImpl(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        // Find user by email (using your existing method that returns User, not Optional)
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new IllegalArgumentException("No user found with email: " + email);
        }
        
        // Generate secure token
        String token = generateSecureToken();
        
        // Set token and expiry (1 hour from now)
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
        
        // Save user with token
        userRepository.save(user);
        
        // Build reset link (frontend URL)
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        
        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
    }

    @Override
    public boolean verifyResetToken(String token) {
        // Find user by reset token (using the new method we added to UserRepository)
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            // Clear expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new IllegalArgumentException("Reset token has expired");
        }
        
        return true;
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Verify token first
        verifyResetToken(token);
        
        // Find user by token
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
        
        // Validate new password (use same rules as registration)
        if (!isValidPassword(newPassword)) {
            throw new IllegalArgumentException(
                    "Password must be 8-12 characters, include uppercase, lowercase, number, and special character."
            );
        }
        
        // Update password
        user.setPassword(newPassword);
        
        // Clear reset token (one-time use)
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        // Save user
        userRepository.save(user);
    }
    
    /**
     * Generate a secure random token (64 characters)
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[48]; // 48 bytes = 64 chars in Base64
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes).replace("=", ""); // Remove padding
    }
    
    /**
     * Password validation (same as in UserServiceImpl)
     */
    private boolean isValidPassword(String password) {
        return password.length() >= 8 &&
               password.length() <= 12 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[a-z].*") &&
               password.matches(".*\\d.*") &&
               password.matches(".*[!@#$%^&*()].*");
    }
}
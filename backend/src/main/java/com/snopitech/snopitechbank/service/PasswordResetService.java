package com.snopitech.snopitechbank.service;

public interface PasswordResetService {
    
    /**
     * Request a password reset for a user by email
     * Generates a reset token and sends email
     */
    void requestPasswordReset(String email);
    
    /**
     * Verify if a reset token is valid (not expired, not used)
     */
    boolean verifyResetToken(String token);
    
    /**
     * Reset password using a valid token
     */
    void resetPassword(String token, String newPassword);
}

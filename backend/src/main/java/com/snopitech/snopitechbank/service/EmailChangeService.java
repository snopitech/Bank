package com.snopitech.snopitechbank.service;

public interface EmailChangeService {
    
    /**
     * Request an email change for a user
     * Generates a verification token and sends email to current email
     */
    void requestEmailChange(String currentEmail, String newEmail);
    
    /**
     * Verify if an email change token is valid (not expired)
     */
    boolean verifyEmailChangeToken(String token);
    
    /**
     * Confirm and update email using a valid token
     */
    void confirmEmailChange(String token, String newEmail);
}
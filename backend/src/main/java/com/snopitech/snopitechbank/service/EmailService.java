package com.snopitech.snopitechbank.service;

public interface EmailService {
    
    /**
     * Send a password reset email to the user
     * @param toEmail The recipient's email address
     * @param userName The recipient's name
     * @param resetLink The password reset link
     */
    void sendPasswordResetEmail(String toEmail, String userName, String resetLink);
    
    /**
     * Send an email change verification email
     * @param toEmail The recipient's current email address
     * @param userName The recipient's name
     * @param verificationLink The email change verification link
     * @param newEmail The new email address being requested
     */
    void sendEmailChangeVerification(String toEmail, String userName, String verificationLink, String newEmail);
    
    /**
     * Send a test email to verify email configuration is working
     * @param toEmail The recipient's email address
     */
    void sendTestEmail(String toEmail);

    void sendEmail(String email, String subject, String htmlContent);
}
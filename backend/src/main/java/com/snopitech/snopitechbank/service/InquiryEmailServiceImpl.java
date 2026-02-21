package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Inquiry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class InquiryEmailServiceImpl implements InquiryEmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(InquiryEmailServiceImpl.class);
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.admin.email:snopitech@gmail.com}")
    private String adminEmail;
    
    @Value("${app.name:Snopitech Bank}")
    private String appName;
    
    public InquiryEmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Override
    public void sendAutoResponse(Inquiry inquiry) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(inquiry.getEmail());
            message.setFrom(fromEmail);
            message.setSubject("We've Received Your Inquiry - Reference: " + inquiry.getReferenceNumber());
            
            String text = String.format(
                "Dear %s,\n\n" +
                "Thank you for contacting %s. We have received your inquiry and our support team will review it shortly.\n\n" +
                "Inquiry Details:\n" +
                "Reference Number: %s\n" +
                "Category: %s\n" +
                "Subject: %s\n" +
                "Submitted: %s\n\n" +
                "We aim to respond within 24-48 hours. For urgent matters, please call our support line.\n\n" +
                "Thank you for banking with us,\n" +
                "%s Support Team\n" +
                "support@snopitechbank.com",
                inquiry.getFullName(),
                appName,
                inquiry.getReferenceNumber(),
                inquiry.getCategory(),
                inquiry.getSubject(),
                inquiry.getCreatedAt(),
                appName
            );
            
            message.setText(text);
            mailSender.send(message);
            logger.info("Auto-response sent to: {}", inquiry.getEmail());
            
        } catch (Exception e) {
            logger.error("Failed to send auto-response email to: {}", inquiry.getEmail(), e);
            throw new RuntimeException("Failed to send auto-response email", e);
        }
    }
    
    @Override
    public void sendAdminNotification(Inquiry inquiry) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setFrom(fromEmail);
            message.setSubject("NEW INQUIRY: " + inquiry.getReferenceNumber() + " - " + inquiry.getCategory());
            
            String userType = inquiry.getUser() != null ? 
                "Registered User (ID: " + inquiry.getUser().getId() + ")" : 
                "Public User";
            
            String text = String.format(
                "New Inquiry Submitted\n" +
                "=====================\n\n" +
                "Reference: %s\n" +
                "Priority: %s\n" +
                "Status: %s\n\n" +
                "Customer Details:\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Phone: %s\n" +
                "User Type: %s\n" +
                "Account: %s\n\n" +
                "Category: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n" +
                "%s\n\n" +
                "Technical Details:\n" +
                "Submitted: %s\n" +
                "IP Address: %s\n" +
                "User Agent: %s",
                inquiry.getReferenceNumber(),
                inquiry.getPriority(),
                inquiry.getStatus(),
                inquiry.getFullName(),
                inquiry.getEmail(),
                inquiry.getPhone() != null ? inquiry.getPhone() : "Not provided",
                userType,
                inquiry.getAccountNumber() != null ? inquiry.getAccountNumber() : "Not specified",
                inquiry.getCategory(),
                inquiry.getSubject(),
                inquiry.getMessage(),
                inquiry.getCreatedAt(),
                inquiry.getIpAddress() != null ? inquiry.getIpAddress() : "Unknown",
                inquiry.getUserAgent() != null ? inquiry.getUserAgent() : "Unknown"
            );
            
            message.setText(text);
            mailSender.send(message);
            logger.info("Admin notification sent for inquiry: {}", inquiry.getReferenceNumber());
            
        } catch (Exception e) {
            logger.error("Failed to send admin notification for inquiry: {}", inquiry.getReferenceNumber(), e);
            // Don't throw - admin notification failure shouldn't fail the whole request
        }
    }
    
    @Override
    public void sendManualResponse(Inquiry inquiry, String adminMessage, String adminName) {
        // For Phase 2
        throw new UnsupportedOperationException("Manual responses not implemented in Phase 1");
    }
}
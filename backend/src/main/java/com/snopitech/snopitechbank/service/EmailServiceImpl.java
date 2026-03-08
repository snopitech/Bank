package com.snopitech.snopitechbank.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    public EmailServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set email details
            helper.setFrom("Snopitech Bank <no-reply@snopitechbank.com>");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Snopitech Bank Password");
            
            // Create HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resetLink", resetLink);
            context.setVariable("currentYear", java.time.Year.now().getValue());
            
            String htmlContent = templateEngine.process("password-reset-email", context);
            helper.setText(htmlContent, true);
            
            // Send the email
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email to " + toEmail, e);
        }
    }

    public void sendSimpleEmail(String toEmail, String subject, String textContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("Snopitech Bank <no-reply@snopitechbank.com>");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            // Create HTML version with better formatting
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 20px; background: #f9f9f9; }" +
                ".code { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; letter-spacing: 5px; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h2>SnopitechBank Verification</h2></div>" +
                "<div class='content'>" +
                "<p>" + textContent.replace("\n", "<br>") + "</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send simple email to " + toEmail, e);
        }
    }

    @Override
    public void sendEmailChangeVerification(String toEmail, String userName, String verificationLink, String newEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set email details
            helper.setFrom("Snopitech Bank <no-reply@snopitechbank.com>");
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email Change - Snopitech Bank");
            
            // Create HTML content using Thymeleaf template
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("toEmail", toEmail);
            context.setVariable("newEmail", newEmail);
            context.setVariable("verificationLink", verificationLink);
            context.setVariable("requestTime", java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")));
            context.setVariable("currentYear", java.time.Year.now().getValue());
            
            String htmlContent = templateEngine.process("email-change-verification", context);
            helper.setText(htmlContent, true);
            
            // Send the email
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email change verification to " + toEmail, e);
        }
    }

    @Override
    public void sendTestEmail(String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("Snopitech Bank <no-reply@snopitechbank.com>");
            helper.setTo(toEmail);
            helper.setSubject("Test Email - Snopitech Bank Email Service");
            
            // Simple test email content
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px; }
                        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 20px; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Snopitech Bank</h1>
                            <p>Email Service Test</p>
                        </div>
                        <div class="content">
                            <h2>Test Successful! ✅</h2>
                            <p>This is a test email to confirm that the Snopitech Bank email service is working correctly.</p>
                            <p>If you're receiving this email, it means:</p>
                            <ul>
                                <li>✅ Spring Boot Mail configuration is correct</li>
                                <li>✅ Gmail SMTP settings are working</li>
                                <li>✅ Email service is ready for production use</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>© %d Snopitech Bank. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(java.time.Year.now().getValue());
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send test email to " + toEmail, e);
        }
    }

    // 🔴 NEW METHOD ADDED - Generic email sender
    @Override
    public void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("Snopitech Bank <no-reply@snopitechbank.com>");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + toEmail, e);
        }
    }
}
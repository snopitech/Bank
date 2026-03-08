package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Employee;
import com.snopitech.snopitechbank.model.HRVerificationCode;
import com.snopitech.snopitechbank.repository.EmployeeRepository;
import com.snopitech.snopitechbank.repository.HRVerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class HRVerificationService {

    @Autowired
    private HRVerificationCodeRepository verificationCodeRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    private static final SecureRandom secureRandom = new SecureRandom();
    @SuppressWarnings("unused")
    private static final int CODE_LENGTH = 6;
    private static final int MAX_ATTEMPTS_PER_HOUR = 5;

    // Track failed attempts for rate limiting (in-memory cache)
    private final Map<Long, Integer> failedAttempts = new HashMap<>();
    private final Map<Long, LocalDateTime> lastAttemptTime = new HashMap<>();

    /**
     * Generate a random 6-digit code
     */
    private String generateCode() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * Create and send verification code to employee email
     */
    @Transactional
    public void createAndSendCode(Employee employee) {
        // Check rate limiting
        if (isRateLimited(employee.getId())) {
            throw new RuntimeException("Too many verification attempts. Please try again later.");
        }

        // Delete any existing unused codes for this employee
        verificationCodeRepository.deleteByEmployee(employee);

        // Generate new code
        String code = generateCode();

        // Create and save verification code
        HRVerificationCode verificationCode = new HRVerificationCode(employee, code);
        verificationCodeRepository.save(verificationCode);

        // Send email
        sendVerificationEmail(employee, code);

        System.out.println("✅ HR Verification code sent to " + employee.getEmail() + ": " + code);
    }

    /**
     * Verify the code entered by employee with lockout after 3 failed attempts
     */
    @Transactional
    public boolean verifyCode(Employee employee, String code) {
        // Check if account is locked
        if (employee.isHrLocked()) {
            throw new RuntimeException("Account is locked due to too many failed attempts. Please try again after 30 minutes.");
        }

        // Find the most recent valid code
        var optionalCode = verificationCodeRepository
            .findByEmployeeAndCodeAndUsedFalse(employee, code);

        if (optionalCode.isEmpty()) {
            // Record failed attempt
            employee.incrementHrFailedAttempts();
            
            // Get current failed attempts with null safety
            Integer failedAttempts = employee.getHrFailedAttempts();
            if (failedAttempts == null) {
                failedAttempts = 0;
            }
            
            // Lock account after 3 failed attempts
            if (failedAttempts >= 3) {
                employee.lockHrAccount();
                employeeRepository.save(employee);
                throw new RuntimeException("Too many failed attempts. Account locked for 30 minutes.");
            }
            
            employeeRepository.save(employee);
            recordFailedAttempt(employee.getId());
            return false;
        }

        HRVerificationCode verificationCode = optionalCode.get();

        // Check if code is expired
        if (verificationCode.isExpired()) {
            verificationCode.setUsed(true); // Mark as used so it can't be tried again
            verificationCodeRepository.save(verificationCode);
            
            // Count as failed attempt
            employee.incrementHrFailedAttempts();
            employeeRepository.save(employee);
            recordFailedAttempt(employee.getId());
            return false;
        }

        // Success - reset failed attempts
        employee.resetHrFailedAttempts();
        employeeRepository.save(employee);

        // Mark code as used
        verificationCode.setUsed(true);
        verificationCode.setUsedAt(LocalDateTime.now());
        verificationCodeRepository.save(verificationCode);

        // Clear failed attempts from cache
        clearFailedAttempts(employee.getId());

        // Delete all old codes for this employee
        verificationCodeRepository.deleteByEmployee(employee);

        return true;
    }

    /**
     * Resend verification code
     */
    @Transactional
    public void resendCode(Employee employee) {
        // Check rate limiting
        if (isRateLimited(employee.getId())) {
            throw new RuntimeException("Too many verification attempts. Please try again later.");
        }

        // Delete old codes and create new one
        verificationCodeRepository.deleteByEmployee(employee);
        createAndSendCode(employee);
    }

    /**
     * Check if employee is rate limited
     */
    private boolean isRateLimited(Long employeeId) {
        Integer attempts = failedAttempts.getOrDefault(employeeId, 0);
        LocalDateTime lastAttempt = lastAttemptTime.get(employeeId);

        // Reset attempts if last attempt was more than an hour ago
        if (lastAttempt != null && lastAttempt.plusHours(1).isBefore(LocalDateTime.now())) {
            failedAttempts.remove(employeeId);
            lastAttemptTime.remove(employeeId);
            return false;
        }

        return attempts >= MAX_ATTEMPTS_PER_HOUR;
    }

    /**
     * Record a failed verification attempt
     */
    private void recordFailedAttempt(Long employeeId) {
        failedAttempts.put(employeeId, failedAttempts.getOrDefault(employeeId, 0) + 1);
        lastAttemptTime.put(employeeId, LocalDateTime.now());
    }

    /**
     * Clear failed attempts on successful verification
     */
    private void clearFailedAttempts(Long employeeId) {
        failedAttempts.remove(employeeId);
        lastAttemptTime.remove(employeeId);
    }

    /**
     * Send verification email to employee
     */
    private void sendVerificationEmail(Employee employee, String code) {
        String subject = "HR Portal Login Verification Code";
        
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #667eea;">HR Portal Login Verification</h2>
                    
                    <p>Dear %s,</p>
                    
                    <p>You have requested to log in to the HR Portal. Use the verification code below to complete your login:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h1 style="font-size: 36px; letter-spacing: 8px; color: #333; margin: 0;">%s</h1>
                    </div>
                    
                    <div style="background-color: #fef9c3; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #854d0e;">
                            <strong>⚠️ Security Notice:</strong> This code will expire in 5 minutes. Never share this code with anyone.
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        If you didn't attempt to log in, please contact your system administrator immediately.
                    </p>
                    
                    <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px;">
                        Snopitech Bank - HR Portal<br>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>
            """,
            employee.getFirstName(),
            code
        );

        emailService.sendEmail(employee.getEmail(), subject, htmlContent);
    }

    /**
     * Clean up expired codes (can be called by a scheduled job)
     */
    @Transactional
    public void cleanupExpiredCodes() {
        verificationCodeRepository.deleteAllExpiredCodes(LocalDateTime.now());
    }
}
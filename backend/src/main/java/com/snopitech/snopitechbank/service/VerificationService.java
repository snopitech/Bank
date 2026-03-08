package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.VerificationCode;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerificationService {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @SuppressWarnings("unused")
    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a 6-digit verification code
     */
    private String generateCode() {
        int code = 100000 + secureRandom.nextInt(900000); // 100000 to 999999
        return String.valueOf(code);
    }

    /**
     * Create and send a verification code to user's email
     */
    @Transactional
    public VerificationCode createAndSendCode(User user) {
        // Invalidate any existing unused codes
        Optional<VerificationCode> existingCode = 
            verificationCodeRepository.findTopByUserAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                user, LocalDateTime.now());
        
        existingCode.ifPresent(code -> {
            code.setUsed(true);
            verificationCodeRepository.save(code);
        });

        // Generate new code
        String code = generateCode();
        VerificationCode verificationCode = new VerificationCode(user, code, CODE_EXPIRY_MINUTES);
        verificationCode = verificationCodeRepository.save(verificationCode);

        // Send email
        String subject = "Your SnopitechBank Login Verification Code";
        String message = String.format(
            "Your verification code is: %s\n\n" +
            "This code will expire in %d minutes.\n\n" +
            "If you didn't request this code, please contact support immediately.",
            code, CODE_EXPIRY_MINUTES
        );

        emailService.sendSimpleEmail(user.getEmail(), subject, message);

        return verificationCode;
    }

    /**
     * Verify the code entered by user
     */
    @Transactional
    public boolean verifyCode(User user, String enteredCode) {
        if (user.isLocked()) {
            throw new RuntimeException("Account is locked. Please contact support.");
        }

        Optional<VerificationCode> validCode = 
            verificationCodeRepository.findTopByUserAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                user, LocalDateTime.now());

        if (validCode.isEmpty()) {
            user.incrementFailedAttempts();
            if (user.getFailedLoginAttempts() >= MAX_ATTEMPTS) {
                user.lockAccount();
                // Send lock notification email
                sendLockNotification(user);
            }
            userRepository.save(user);
            return false;
        }

        VerificationCode verificationCode = validCode.get();
        
        if (verificationCode.getCode().equals(enteredCode)) {
            verificationCode.setUsed(true);
            verificationCodeRepository.save(verificationCode);
            user.resetFailedAttempts();
            userRepository.save(user);
            return true;
        } else {
            user.incrementFailedAttempts();
            if (user.getFailedLoginAttempts() >= MAX_ATTEMPTS) {
                user.lockAccount();
                // Send lock notification email
                sendLockNotification(user);
            }
            userRepository.save(user);
            return false;
        }
    }

    /**
     * Resend verification code
     */
    @Transactional
    public VerificationCode resendCode(User user) {
        return createAndSendCode(user);
    }

    /**
     * Send notification when account is locked
     */
    private void sendLockNotification(User user) {
        String subject = "Your SnopitechBank Account Has Been Locked";
        String message = String.format(
            "Dear %s %s,\n\n" +
            "Your account has been temporarily locked due to multiple failed verification attempts.\n" +
            "The lock will expire in 30 minutes.\n\n" +
            "If you need immediate assistance, please contact support at:\n" +
            "📞 +1 (713) 870-1132\n" +
            "📧 snopitech@gmail.com\n\n" +
            "Thank you for your patience.\n\n" +
            "SnopitechBank Security Team",
            user.getFirstName(), user.getLastName()
        );
        
        emailService.sendSimpleEmail(user.getEmail(), subject, message);
    }
}

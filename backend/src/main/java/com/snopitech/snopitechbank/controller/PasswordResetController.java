package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.PasswordResetRequestDTO;
import com.snopitech.snopitechbank.dto.ResetPasswordDTO;
import com.snopitech.snopitechbank.dto.VerifyTokenResponseDTO;
import com.snopitech.snopitechbank.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    /**
     * POST /auth/forgot-password
     * Request a password reset link to be sent to email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequestDTO request) {
        try {
            passwordResetService.requestPasswordReset(request.getEmail());
            // Always return success (for security - don't reveal if email exists)
            return ResponseEntity.ok().body("If an account exists with this email, a reset link has been sent.");
        } catch (Exception e) {
            // Still return generic message for security
            return ResponseEntity.ok().body("If an account exists with this email, a reset link has been sent.");
        }
    }

    /**
     * GET /auth/verify-reset-token/{token}
     * Verify if a reset token is valid
     */
    @GetMapping("/verify-reset-token/{token}")
    public ResponseEntity<VerifyTokenResponseDTO> verifyResetToken(@PathVariable String token) {
        try {
            // Call the service - don't need to store the result since exception is thrown if invalid
            passwordResetService.verifyResetToken(token);
            return ResponseEntity.ok(new VerifyTokenResponseDTO(true, "Token is valid", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(new VerifyTokenResponseDTO(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.ok(new VerifyTokenResponseDTO(false, "Invalid or expired token", null));
        }
    }

    /**
     * POST /auth/reset-password
     * Reset password using a valid token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok().body("Password has been reset successfully. You can now log in with your new password.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reset password. Please try again.");
        }
    }
}
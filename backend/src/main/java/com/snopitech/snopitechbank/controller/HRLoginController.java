package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.EmployeeDTO;
import com.snopitech.snopitechbank.model.Employee;
import com.snopitech.snopitechbank.repository.EmployeeRepository;
import com.snopitech.snopitechbank.service.EmployeeService;
import com.snopitech.snopitechbank.service.HRVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/auth")
public class HRLoginController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private HRVerificationService verificationService;

    // Temporary storage for login sessions (in production, use Redis)
    private final Map<String, Long> pendingLogins = new HashMap<>();

    /**
     * Step 1: Employee login with email and password
     * POST /api/hr/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email and password are required"
                ));
            }

            // Find employee by email
            Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            // Check if employee is approved
            if (!employee.isApproved()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Account not approved yet. Please contact HR."
                ));
            }

            // Check if employee is active
            if (!employee.getIsActive()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Account is deactivated. Please contact HR."
                ));
            }

            // Verify password (you'll need to implement password verification)
            // This assumes you have a method to verify password
            boolean passwordValid = employeeService.verifyPassword(employee.getId(), password);
            if (!passwordValid) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid email or password"
                ));
            }

            // Generate and send verification code
            verificationService.createAndSendCode(employee);

            // Create temporary token for this login session
            String tempToken = UUID.randomUUID().toString();
            pendingLogins.put(tempToken, employee.getId());

            // Return response - user needs to verify code
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requiresCode", true);
            response.put("tempToken", tempToken);
            response.put("message", "Verification code sent to your email");
            response.put("email", employee.getEmail());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Login failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Step 2: Verify the code and complete login
     * POST /api/hr/auth/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String tempToken = request.get("tempToken");
            String code = request.get("code");

            if (tempToken == null || code == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Temp token and verification code are required"
                ));
            }

            // Get employee ID from temp token
            Long employeeId = pendingLogins.get(tempToken);
            if (employeeId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired login session. Please login again."
                ));
            }

            // Find employee
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Verify the code
            boolean isValid = verificationService.verifyCode(employee, code);

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired verification code"
                ));
            }

            // Remove temp token
            pendingLogins.remove(tempToken);

            // Update last login time
            employeeService.updateLastLogin(employeeId);

            // Generate session token (in production, use JWT or proper session management)
            String sessionToken = UUID.randomUUID().toString();

            // Convert to DTO for response
            EmployeeDTO employeeDTO = employeeService.convertEmployeeToDTO(employee);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", sessionToken);
            response.put("employee", employeeDTO);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Verification failed: " + e.getMessage()
            ));
        }
    }
         
/**
 * Admin unlock HR account
 * POST /api/hr/admin/unlock/{employeeId}
 */
@PostMapping("/admin/unlock/{employeeId}")
public ResponseEntity<?> unlockHRAccount(@PathVariable Long employeeId) {
    try {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        employee.resetHrFailedAttempts();
        employeeRepository.save(employee);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "HR account unlocked successfully"
        ));
        
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage()
        ));
    }
}

    /**
     * Resend verification code
     * POST /api/hr/auth/resend
     */
    @PostMapping("/resend")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, String> request) {
        try {
            String tempToken = request.get("tempToken");

            if (tempToken == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Temp token is required"
                ));
            }

            // Get employee ID from temp token
            Long employeeId = pendingLogins.get(tempToken);
            if (employeeId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired login session. Please login again."
                ));
            }

            // Find employee
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Resend code
            verificationService.resendCode(employee);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "New verification code sent to your email"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to resend code: " + e.getMessage()
            ));
        }
    }
}

package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.EmployeeDTO;
import com.snopitech.snopitechbank.model.Employee;
import com.snopitech.snopitechbank.repository.EmployeeRepository;
import com.snopitech.snopitechbank.service.EmployeeService;
import com.snopitech.snopitechbank.service.TOTPService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/employees/totp")
public class EmployeeTOTPController {

    private final TOTPService totpService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;

    public EmployeeTOTPController(TOTPService totpService, 
                                  EmployeeRepository employeeRepository,
                                  EmployeeService employeeService) {
        this.totpService = totpService;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
    }

    /**
     * Step 1: Generate TOTP secret and QR code URI
     * POST /api/employees/totp/setup?employeeId={id}
     */
    @PostMapping("/setup")
    public ResponseEntity<?> setupTOTP(@RequestParam Long employeeId) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Generate new secret
            String secret = totpService.generateSecret();
            
            // Save secret to employee (but don't enable yet until verified)
            employee.setTotpSecret(secret);
            employee.setTotpSetupCompleted(false);
            employeeRepository.save(employee);

          // Generate URI for QR code
String uri = totpService.generateTOTPURIForEmployee(
    employee.getFullName(), 
    employee.getEmail(), 
    secret
);
            Map<String, Object> response = new HashMap<>();
            response.put("secret", secret);
            response.put("uri", uri);
            response.put("message", "Scan this QR code with Microsoft Authenticator");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Step 2: Verify the code and enable TOTP
     * POST /api/employees/totp/verify-and-enable
     */
    @PostMapping("/verify-and-enable")
    public ResponseEntity<?> verifyAndEnableTOTP(@RequestBody Map<String, String> request) {
        try {
            Long employeeId = Long.parseLong(request.get("employeeId"));
            String code = request.get("code");
            
            if (code == null || code.length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid 6-digit code is required"));
            }

            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
          if (employee.getTotpSecret() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "TOTP not initialized. Please start setup first."));
        }

        // Verify the code
        boolean isValid = totpService.verifyTOTP(employee.getTotpSecret(), code);

            if (isValid) {
                employee.setTotpEnabled(true);
                employee.setTotpSetupCompleted(true);
                employeeRepository.save(employee);

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "TOTP enabled successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid verification code. Please try again."
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify TOTP code during login
     * POST /api/employees/totp/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyTOTP(@RequestBody Map<String, String> request) {
        try {
            Long employeeId = Long.parseLong(request.get("employeeId"));
            String code = request.get("code");
            
            if (code == null || code.length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid 6-digit code is required"));
            }

            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

           if (!employee.getTotpEnabled()) {
    return ResponseEntity.badRequest().body(Map.of("error", "TOTP is not enabled for this employee"));
}

            boolean isValid = totpService.verifyTOTP(employee.getTotpSecret(), code);

            if (isValid) {
                // Update last login
                employeeService.updateLastLogin(employeeId);
                
                EmployeeDTO employeeDTO = employeeService.convertEmployeeToDTO(employee);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "TOTP verification successful",
                    "employee", employeeDTO
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid verification code"
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Disable TOTP for an employee
     * POST /api/employees/totp/disable
     */
    @PostMapping("/disable")
    public ResponseEntity<?> disableTOTP(@RequestBody Map<String, String> request) {
        try {
            Long employeeId = Long.parseLong(request.get("employeeId"));
            String password = request.get("password");

            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Verify password before disabling TOTP
            boolean passwordValid = employeeService.verifyPassword(employeeId, password);
            if (!passwordValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
            }

            employee.setTotpSecret(null);
            employee.setTotpEnabled(false);
            employee.setTotpSetupCompleted(false);
            employeeRepository.save(employee);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "TOTP disabled successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check TOTP status for an employee
     * GET /api/employees/totp/status?employeeId={id}
     */
    @GetMapping("/status")
    public ResponseEntity<?> getTOTPStatus(@RequestParam Long employeeId) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

          Map<String, Object> response = new HashMap<>();
response.put("totpEnabled", employee.getTotpEnabled());
response.put("totpSetupCompleted", employee.getTotpSetupCompleted());
response.put("employeeId", employee.getId());
response.put("email", employee.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

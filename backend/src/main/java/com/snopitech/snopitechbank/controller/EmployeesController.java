package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.EmployeeDTO;
import com.snopitech.snopitechbank.dto.CreateEmployeeRequest;
import com.snopitech.snopitechbank.dto.ApproveEmployeeRequest;
import com.snopitech.snopitechbank.dto.RejectEmployeeRequest;
import com.snopitech.snopitechbank.dto.EmployeeProfileUpdateRequest;
import com.snopitech.snopitechbank.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeesController {  // 👈 Changed from EmployeeController to EmployeesController

    private final EmployeeService employeeService;

    public EmployeesController(EmployeeService employeeService) {  // 👈 Changed here too
        this.employeeService = employeeService;
    }
    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Create a new employee profile (pending approval)
     * This can be accessed by anyone (potential employees)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@RequestBody CreateEmployeeRequest request) {
        try {
            EmployeeDTO employee = employeeService.createEmployee(request);
            return ResponseEntity.ok(Map.of(
                "message", "Employee profile created successfully. Awaiting approval.",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve employee by token (from email link)
     * Accessed via link in email
     */
    @PostMapping("/approve")
    public ResponseEntity<?> approveByToken(@RequestParam String token, @RequestBody ApproveEmployeeRequest request) {
        try {
            EmployeeDTO employee = employeeService.approveEmployeeByToken(token, request);
            return ResponseEntity.ok(Map.of(
                "message", "Employee approved successfully",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject employee by token (from email link)
     * Accessed via link in email
     */
    @PostMapping("/reject")
    public ResponseEntity<?> rejectByToken(@RequestParam String token, @RequestBody RejectEmployeeRequest request) {
        try {
            // Note: You might need to add a rejectByToken method to EmployeeService
            // For now, this is a placeholder
            return ResponseEntity.badRequest().body(Map.of("error", "Reject by token not implemented yet"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Employee login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            EmployeeDTO employee = employeeService.login(email, password);
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change employee password
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            EmployeeDTO employee = employeeService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all pending employees (admin only)
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingEmployees() {
        try {
            List<EmployeeDTO> employees = employeeService.getPendingEmployees();
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all approved employees (admin only)
     */
    @GetMapping("/admin/approved")
    public ResponseEntity<?> getApprovedEmployees() {
        try {
            List<EmployeeDTO> employees = employeeService.getApprovedEmployees();
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
       
    /**
     * Get all employees (admin only)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<EmployeeDTO> employees = employeeService.getAllEmployees();
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get employee by ID (admin only)
     */
    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        try {
            EmployeeDTO employee = employeeService.getEmployeeById(id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get employee by email (admin only)
     */
    @GetMapping("/admin/by-email")
    public ResponseEntity<?> getEmployeeByEmail(@RequestParam String email) {
        try {
            EmployeeDTO employee = employeeService.getEmployeeByEmail(email);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete all employees (admin only) - USE WITH CAUTION
     */
    @DeleteMapping("/admin/delete-all")
    public ResponseEntity<?> deleteAllEmployees() {
        try {
            employeeService.deleteAllEmployees();
            return ResponseEntity.ok(Map.of(
                "message", "All employees deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Search employees (admin only)
     */
    @GetMapping("/admin/search")
    public ResponseEntity<?> searchEmployees(@RequestParam String q) {
        try {
            List<EmployeeDTO> employees = employeeService.searchEmployees(q);
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve employee by ID (admin approval)
     */
    @PostMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveEmployeeById(@PathVariable Long id, @RequestBody ApproveEmployeeRequest request) {
        try {
            EmployeeDTO employee = employeeService.approveEmployeeById(id, request);
            return ResponseEntity.ok(Map.of(
                "message", "Employee approved successfully",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject employee by ID (admin rejection)
     */
    @PostMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectEmployee(@PathVariable Long id, @RequestBody RejectEmployeeRequest request) {
        try {
            EmployeeDTO employee = employeeService.rejectEmployee(id, request);
            return ResponseEntity.ok(Map.of(
                "message", "Employee rejected successfully",
                "employee", employee
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete employee by ID (admin only)
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(Map.of(
                "message", "Employee deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update employee profile (admin/employee self-service)
     */
    @PutMapping("/admin/{id}/update-profile")
    public ResponseEntity<?> updateEmployeeProfile(
        @PathVariable Long id,
        @RequestBody EmployeeProfileUpdateRequest request) {
        try {
            EmployeeDTO employee = employeeService.updateEmployeeProfile(id, request);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    /**
 * HR-initiated password reset - generates temporary password and emails employee
 */
@PostMapping("/admin/{id}/reset-password")
public ResponseEntity<?> resetEmployeePassword(@PathVariable Long id) {
    try {
        String temporaryPassword = employeeService.resetEmployeePassword(id);
        return ResponseEntity.ok(Map.of(
            "message", "Password reset successful. Temporary password has been emailed to the employee.",
            "temporaryPassword", temporaryPassword // Remove this in production
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

/**
 * Disable employee account (prevent login)
 */
@PutMapping("/admin/{id}/disable")
public ResponseEntity<?> disableEmployee(@PathVariable Long id) {
    try {
        EmployeeDTO employee = employeeService.disableEmployee(id);
        return ResponseEntity.ok(Map.of(
            "message", "Employee account disabled successfully",
            "employee", employee
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

/**
 * Enable employee account
 */
@PutMapping("/admin/{id}/enable")
public ResponseEntity<?> enableEmployee(@PathVariable Long id) {
    try {
        EmployeeDTO employee = employeeService.enableEmployee(id);
        return ResponseEntity.ok(Map.of(
            "message", "Employee account enabled successfully",
            "employee", employee
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
}
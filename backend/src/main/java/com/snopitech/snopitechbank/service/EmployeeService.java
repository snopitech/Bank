package com.snopitech.snopitechbank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
// Fix the import - remove the main.java prefix
import com.snopitech.snopitechbank.dto.*;
import com.snopitech.snopitechbank.model.Employee;
import com.snopitech.snopitechbank.repository.EmployeeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.bank.email:snopitech@gmail.com}")
    private String bankEmail;

    // ==================== CREATE EMPLOYEE ====================

    /**
     * Create a new employee profile (pending approval)
     */
    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        // Check if email already exists
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee with email " + request.getEmail() + " already exists");
        }

        // Check if employee ID already exists
        if (employeeRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee with ID " + request.getEmployeeId() + " already exists");
        }
     
        // Create new employee
        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setSsn(request.getSsn());
        employee.setEmployeeId(request.getEmployeeId());
        employee.setDepartment(request.getDepartment());
        employee.setHireDate(request.getHireDate());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setReportsTo(request.getReportsTo());
        employee.setRole(request.getRole());

        // Convert permissions map to JSON string
        if (request.getPermissions() != null) {
            try {
                String permissionsJson = objectMapper.writeValueAsString(request.getPermissions());
                employee.setPermissions(permissionsJson);
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize permissions");
            }
        }

        employee.setWorkPhone(request.getWorkPhone());
        employee.setWorkEmail(request.getWorkEmail());
        employee.setOfficeLocation(request.getOfficeLocation());

        employee.setAddressLine1(request.getAddressLine1());
        employee.setAddressLine2(request.getAddressLine2());
        employee.setCity(request.getCity());
        employee.setState(request.getState());
        employee.setZipCode(request.getZipCode());
        employee.setCountry(request.getCountry());

        employee.setEmergencyName(request.getEmergencyName());
        employee.setEmergencyRelationship(request.getEmergencyRelationship());
        employee.setEmergencyPhone(request.getEmergencyPhone());

        // Generate approval token
        String approvalToken = generateApprovalToken();
        employee.setApprovalToken(approvalToken);
        employee.setApprovalTokenExpiry(LocalDateTime.now().plusDays(7)); // Token valid for 7 days

        Employee savedEmployee = employeeRepository.save(employee);

        // Send approval email to bank
        sendApprovalEmail(savedEmployee);

        return convertToDTO(savedEmployee);
    }

    // ==================== GET EMPLOYEES ====================

    /**
     * Get all pending employees
     */
    public List<EmployeeDTO> getPendingEmployees() {
        List<Employee> employees = employeeRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all approved employees
     */
    public List<EmployeeDTO> getApprovedEmployees() {
        List<Employee> employees = employeeRepository.findByStatusAndIsActiveTrue("APPROVED");
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get employee by ID
     */
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return convertToDTO(employee);
    }

    /**
     * Get employee by email
     */
    public EmployeeDTO getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
        return convertToDTO(employee);
    }
     /**
 * Get all employees (all statuses)
 */
public List<EmployeeDTO> getAllEmployees() {
    List<Employee> employees = employeeRepository.findAll();
    return employees.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
            
   }
      /**
 * Delete all employees (admin only) - USE WITH CAUTION
 */
@Transactional
public void deleteAllEmployees() {
    employeeRepository.deleteAll();
   }
   
   /**
 * Update employee profile (editable fields only)
 * UPDATED: Changed parameter type from UpdateEmployeeProfileRequest to EmployeeProfileUpdateRequest
 */
@Transactional
public EmployeeDTO updateEmployeeProfile(Long id, EmployeeProfileUpdateRequest request) {
    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    
    // Update only editable fields
    if (request.getPhone() != null) employee.setPhone(request.getPhone());
    if (request.getWorkPhone() != null) employee.setWorkPhone(request.getWorkPhone());
    if (request.getOfficeLocation() != null) employee.setOfficeLocation(request.getOfficeLocation());
    if (request.getAddressLine1() != null) employee.setAddressLine1(request.getAddressLine1());
    if (request.getAddressLine2() != null) employee.setAddressLine2(request.getAddressLine2());
    if (request.getCity() != null) employee.setCity(request.getCity());
    if (request.getState() != null) employee.setState(request.getState());
    if (request.getZipCode() != null) employee.setZipCode(request.getZipCode());
    if (request.getCountry() != null) employee.setCountry(request.getCountry());
    if (request.getEmergencyName() != null) employee.setEmergencyName(request.getEmergencyName());
    if (request.getEmergencyRelationship() != null) employee.setEmergencyRelationship(request.getEmergencyRelationship());
    if (request.getEmergencyPhone() != null) employee.setEmergencyPhone(request.getEmergencyPhone());
    
    employee.setUpdatedAt(LocalDateTime.now());
    
    Employee updatedEmployee = employeeRepository.save(employee);
    return convertToDTO(updatedEmployee);
}

    /**
     * Search employees
     */
    public List<EmployeeDTO> searchEmployees(String searchTerm) {
        List<Employee> employees = employeeRepository.searchEmployees(searchTerm);
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== APPROVE / REJECT ====================

    /**
     * Approve employee by token (from email link)
     */
    @Transactional
    public EmployeeDTO approveEmployeeByToken(String token, ApproveEmployeeRequest request) {
        Employee employee = employeeRepository.findByApprovalToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid approval token"));

        if (employee.getApprovalTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Approval token has expired");
        }

        return approveEmployee(employee, request);
    }

    /**
     * Approve employee by ID (admin approval)
     */
    @Transactional
    public EmployeeDTO approveEmployeeById(Long id, ApproveEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (!employee.isPending()) {
            throw new RuntimeException("Employee is not in pending state");
        }

        return approveEmployee(employee, request);
    }

    /**
     * Internal method to approve employee
     */
    private EmployeeDTO approveEmployee(Employee employee, ApproveEmployeeRequest request) {
        // Generate password
        String password = request.getCustomPassword() != null 
            ? request.getCustomPassword() 
            : generateRandomPassword();

        // Set employee as approved
        employee.setStatus("APPROVED");
        employee.setApprovedAt(LocalDateTime.now());
        employee.setApprovedBy(request.getApprovedBy());
        employee.setPasswordHash(passwordEncoder.encode(password));
        employee.setPasswordChangeRequired(true);
        employee.setIsActive(true);
        employee.setApprovalToken(null);
        employee.setApprovalTokenExpiry(null);

        Employee approvedEmployee = employeeRepository.save(employee);

        // Send welcome email to employee
        if (request.isSendWelcomeEmail()) {
            sendWelcomeEmail(approvedEmployee, password);
        }

        return convertToDTO(approvedEmployee);
    }

    /**
     * Reject employee by ID
     */
    @Transactional
    public EmployeeDTO rejectEmployee(Long id, RejectEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (!employee.isPending()) {
            throw new RuntimeException("Employee is not in pending state");
        }

        employee.setStatus("REJECTED");
        employee.setRejectionReason(request.getReason());
        employee.setApprovalToken(null);
        employee.setApprovalTokenExpiry(null);

        Employee rejectedEmployee = employeeRepository.save(employee);

        // Send rejection email
        if (request.isSendNotificationEmail()) {
            sendRejectionEmail(rejectedEmployee, request.getReason());
        }

        return convertToDTO(rejectedEmployee);
    }
        /**
 * Reset employee password (HR-initiated)
 * Generates a temporary password, updates the database, and emails the employee
 */
@Transactional
public String resetEmployeePassword(Long id) {
    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    
    // Generate temporary password
    String temporaryPassword = generateRandomPassword();
    
    // Update password in database
    employee.setPasswordHash(passwordEncoder.encode(temporaryPassword));
    employee.setPasswordChangeRequired(true);
    employee.setUpdatedAt(LocalDateTime.now());
    
    employeeRepository.save(employee);
    
    // Send email to employee with temporary password
    sendTemporaryPasswordEmail(employee, temporaryPassword);
    
    return temporaryPassword; // Remove this in production - only return for testing
}

/**
 * Send temporary password email to employee
 */
private void sendTemporaryPasswordEmail(Employee employee, String temporaryPassword) {
    String subject = "Your Snopitech Bank Password Has Been Reset";
    
    String loginLink = "http://localhost:5173/employee-login"; // Adjust port as needed

    String htmlContent = String.format("""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Password Reset - Snopitech Bank</h2>
                
                <p>Dear %s,</p>
                
                <p>Your employee account password has been reset by HR. You can now log in with the temporary password below:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Temporary Credentials:</h3>
                    <p><strong>Email:</strong> %s</p>
                    <p><strong>Temporary Password:</strong> <code style="background-color: #e0e0e0; padding: 4px 8px; border-radius: 4px;">%s</code></p>
                </div>
                
                <div style="background-color: #fef9c3; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #854d0e;">
                        <strong>⚠️ Important:</strong> You will be required to change your password on first login.
                    </p>
                </div>
                
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Login to Your Account</a>
                </div>
                
                <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
                
                <p style="color: #666; font-size: 12px;">
                    If you did not request this password reset, please contact HR immediately.
                </p>
            </div>
        </body>
        </html>
        """,
        employee.getFirstName(),
        employee.getEmail(),
        temporaryPassword,
        loginLink
    );

    emailService.sendEmail(employee.getEmail(), subject, htmlContent);
}

/**
 * Disable employee account
 */
@Transactional
public EmployeeDTO disableEmployee(Long id) {
    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    
    employee.setIsActive(false);
    employee.setUpdatedAt(LocalDateTime.now());
    
    Employee updatedEmployee = employeeRepository.save(employee);
    return convertToDTO(updatedEmployee);
}

/**
 * Enable employee account
 */
@Transactional
public EmployeeDTO enableEmployee(Long id) {
    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    
    employee.setIsActive(true);
    employee.setUpdatedAt(LocalDateTime.now());
    
    Employee updatedEmployee = employeeRepository.save(employee);
    return convertToDTO(updatedEmployee);
}
    // ==================== EMPLOYEE LOGIN ====================

    /**
     * Employee login
     */
    public EmployeeDTO login(String email, String password) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!employee.isApproved()) {
            throw new RuntimeException("Account not approved yet");
        }

        if (!employee.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(password, employee.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        employee.setLastLoginAt(LocalDateTime.now());
        employeeRepository.save(employee);

        return convertToDTO(employee);
    }

    /**
     * Change employee password
     */
    @Transactional
    public EmployeeDTO changePassword(String email, String currentPassword, String newPassword) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!passwordEncoder.matches(currentPassword, employee.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        employee.setPasswordHash(passwordEncoder.encode(newPassword));
        employee.setPasswordChangeRequired(false);
        employee.setUpdatedAt(LocalDateTime.now());

        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToDTO(updatedEmployee);
    }

    // ==================== DELETE EMPLOYEE ====================

    /**
     * Delete employee by ID (admin only)
     */
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        
        employeeRepository.delete(employee);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate approval token
     */
    private String generateApprovalToken() {
        return UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
    }

    /**
     * Generate random password
     */
    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }

    /**
     * Send approval email to bank
     */
    private void sendApprovalEmail(Employee employee) {
        String subject = "New Employee Profile Pending Approval - " + employee.getFullName();
        
        // ✅ FIXED: Changed from port 5176 to 5173 to match your frontend
        String approvalLink = "http://localhost:5173/employee-approval?token=" + employee.getApprovalToken();
        String rejectLink = "http://localhost:5173/employee-approval?token=" + employee.getApprovalToken();

        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #667eea;">New Employee Profile Pending Approval</h2>
                
                <p>A new employee profile has been created and requires your approval.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Employee Details:</h3>
                    <table style="width: 100%%;">
                        <tr><td><strong>Name:</strong></td><td>%s %s</td></tr>
                        <tr><td><strong>Email:</strong></td><td>%s</td></tr>
                        <tr><td><strong>Employee ID:</strong></td><td>%s</td></tr>
                        <tr><td><strong>Department:</strong></td><td>%s</td></tr>
                        <tr><td><strong>Role:</strong></td><td>%s</td></tr>
                        <tr><td><strong>Hire Date:</strong></td><td>%s</td></tr>
                    </table>
                </div>
                
                <p>Please review the details and take action:</p>
                
                <div style="margin: 30px 0;">
                    <a href="%s" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-right: 10px;">✓ Approve</a>
                    <a href="%s" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">✗ Reject</a>
                </div>
                
                <p style="color: #666; font-size: 12px;">This link will expire in 7 days.</p>
                
                <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px;">Snopitech Bank - Employee Onboarding System</p>
            </body>
            </html>
            """,
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getEmployeeId(),
            employee.getDepartment() != null ? employee.getDepartment() : "Not specified",
            employee.getRole() != null ? employee.getRole() : "Not specified",
            employee.getHireDate() != null ? employee.getHireDate().toString() : "Not specified",
            approvalLink,
            rejectLink
        );

        emailService.sendEmail(bankEmail, subject, htmlContent);
    }

    /**
     * Send welcome email to employee
     */
    private void sendWelcomeEmail(Employee employee, String password) {
        String subject = "Welcome to Snopitech Bank - Your Account Details";
        
        String loginLink = "http://localhost:3000/employee/login";

        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Welcome to Snopitech Bank, %s!</h2>
                    
                    <p>Your employee account has been approved. You can now access the employee portal.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Your Login Credentials:</h3>
                        <p><strong>Email:</strong> %s</p>
                        <p><strong>Temporary Password:</strong> <code style="background-color: #e0e0e0; padding: 4px 8px; border-radius: 4px;">%s</code></p>
                    </div>
                    
                    <div style="background-color: #fef9c3; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #854d0e;">
                            <strong>⚠️ Important:</strong> You will be required to change your password on first login.
                        </p>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <a href="%s" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Access Employee Portal</a>
                    </div>
                    
                    <p><strong>Employee Details:</strong></p>
                    <table style="width: 100%%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0;"><strong>Employee ID:</strong></td><td>%s</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Department:</strong></td><td>%s</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Role:</strong></td><td>%s</td></tr>
                    </table>
                    
                    <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
                    
                    <p style="color: #666; font-size: 12px;">
                        For security reasons, please change your password immediately after logging in.<br>
                        If you did not request this account, please contact IT support immediately.
                    </p>
                </div>
            </body>
            </html>
            """,
            employee.getFirstName(),
            employee.getEmail(),
            password,
            loginLink,
            employee.getEmployeeId(),
            employee.getDepartment() != null ? employee.getDepartment() : "Not specified",
            employee.getRole() != null ? employee.getRole() : "Not specified"
        );

        emailService.sendEmail(employee.getEmail(), subject, htmlContent);
    }

    /**
     * Send rejection email
     */
    private void sendRejectionEmail(Employee employee, String reason) {
        String subject = "Update on Your Employee Application - Snopitech Bank";

        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #667eea;">Employee Application Status</h2>
                
                <p>Dear %s,</p>
                
                <p>We have reviewed your employee application and regret to inform you that it has been rejected.</p>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> %s</p>
                </div>
                
                <p>If you believe this is an error or would like to discuss this further, please contact HR.</p>
                
                <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px;">Snopitech Bank - Human Resources</p>
            </body>
            </html>
            """,
            employee.getFullName(),
            reason
        );

        emailService.sendEmail(employee.getEmail(), subject, htmlContent);
    }

    /**
     * Convert Employee entity to DTO
     */
    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getEmployeeId(),
            employee.getStatus(),
            employee.getCreatedAt()
        );

        dto.setPhone(employee.getPhone());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setMaskedSsn(employee.getMaskedSsn());
        dto.setDepartment(employee.getDepartment());
        dto.setHireDate(employee.getHireDate());
        dto.setEmploymentType(employee.getEmploymentType());
        dto.setReportsTo(employee.getReportsTo());
        dto.setRole(employee.getRole());

        // Parse permissions JSON
        if (employee.getPermissions() != null) {
            try {
                Map<String, Boolean> permissions = objectMapper.readValue(
                    employee.getPermissions(), 
                    objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Boolean.class)
                );
                dto.setPermissions(permissions);
            } catch (Exception e) {
                // Log error but don't fail
                System.err.println("Failed to parse permissions for employee " + employee.getId());
            }
        }

        dto.setWorkPhone(employee.getWorkPhone());
        dto.setWorkEmail(employee.getWorkEmail());
        dto.setOfficeLocation(employee.getOfficeLocation());

        dto.setAddressLine1(employee.getAddressLine1());
        dto.setAddressLine2(employee.getAddressLine2());
        dto.setCity(employee.getCity());
        dto.setState(employee.getState());
        dto.setZipCode(employee.getZipCode());
        dto.setCountry(employee.getCountry());

        dto.setEmergencyName(employee.getEmergencyName());
        dto.setEmergencyRelationship(employee.getEmergencyRelationship());
        dto.setEmergencyPhone(employee.getEmergencyPhone());

        dto.setUpdatedAt(employee.getUpdatedAt());
        dto.setApprovedAt(employee.getApprovedAt());
        dto.setApprovedBy(employee.getApprovedBy());
        dto.setIsActive(employee.getIsActive());
        dto.setPasswordChangeRequired(employee.getPasswordChangeRequired());
        dto.setLastLoginAt(employee.getLastLoginAt());

        return dto;
    }
}
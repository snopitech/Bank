package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.USVerification;
import com.snopitech.snopitechbank.service.USVerificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/auth/us-verification")
@CrossOrigin(origins = "http://localhost:5173")
public class USVerificationController {

    @Autowired
    private USVerificationService usVerificationService;

    @SuppressWarnings("unused")
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Submit US citizen verification
     * POST /auth/us-verification/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitVerification(@RequestBody Map<String, Object> request) {
        try {
            // Extract and validate fields
            String email = (String) request.get("email");
            String firstName = (String) request.get("firstName");
            String lastName = (String) request.get("lastName");
            String phone = (String) request.get("phone");
            String dateOfBirthStr = (String) request.get("dateOfBirth");
            String ssn = (String) request.get("ssn");
            String birthCity = (String) request.get("birthCity");
            String birthState = (String) request.get("birthState");
            String birthCountry = (String) request.get("birthCountry");
            String addressLine1 = (String) request.get("addressLine1");
            String addressLine2 = (String) request.get("addressLine2");
            String city = (String) request.get("city");
            String state = (String) request.get("state");
            String zipCode = (String) request.get("zipCode");
            String country = (String) request.get("country");
            String employmentStatus = (String) request.get("employmentStatus");
            String annualIncomeStr = (String) request.get("annualIncome");
            String sourceOfFunds = (String) request.get("sourceOfFunds");
            String riskTolerance = (String) request.get("riskTolerance");
            String taxBracket = (String) request.get("taxBracket");
            String password = (String) request.get("password");
            
            // Security questions
            String securityQuestion1 = (String) request.get("securityQuestion1");
            String securityAnswer1 = (String) request.get("securityAnswer1");
            String securityQuestion2 = (String) request.get("securityQuestion2");
            String securityAnswer2 = (String) request.get("securityAnswer2");
            String securityQuestion3 = (String) request.get("securityQuestion3");
            String securityAnswer3 = (String) request.get("securityAnswer3");

            // Validate required fields
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (firstName == null || firstName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "First name is required"));
            }
            if (lastName == null || lastName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Last name is required"));
            }
            if (dateOfBirthStr == null || dateOfBirthStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Date of birth is required"));
            }
            if (ssn == null || ssn.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "SSN is required"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }

            // Validate SSN format (XXX-XX-XXXX)
            if (!ssn.matches("\\d{3}-\\d{2}-\\d{4}")) {
                return ResponseEntity.badRequest().body(Map.of("error", "SSN must be in format: XXX-XX-XXXX"));
            }

            // Parse date of birth
            LocalDate dateOfBirth;
            try {
                dateOfBirth = LocalDate.parse(dateOfBirthStr);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
            }

            // Parse annual income
            Double annualIncome = null;
            if (annualIncomeStr != null && !annualIncomeStr.trim().isEmpty()) {
                try {
                    // Remove commas and convert
                    String cleanValue = annualIncomeStr.replaceAll("[^\\d.]", "");
                    if (!cleanValue.isEmpty()) {
                        annualIncome = Double.parseDouble(cleanValue);
                    }
                } catch (NumberFormatException e) {
                    // If it's a range, use median value
                    if (annualIncomeStr.contains("$25,000 - $49,999")) annualIncome = 37500.0;
                    else if (annualIncomeStr.contains("$50,000 - $74,999")) annualIncome = 62500.0;
                    else if (annualIncomeStr.contains("$75,000 - $99,999")) annualIncome = 87500.0;
                    else if (annualIncomeStr.contains("$100,000 - $149,999")) annualIncome = 125000.0;
                    else if (annualIncomeStr.contains("$150,000 - $199,999")) annualIncome = 175000.0;
                    else if (annualIncomeStr.contains("$200,000 - $299,999")) annualIncome = 250000.0;
                    else if (annualIncomeStr.contains("$300,000+")) annualIncome = 300000.0;
                    else if (annualIncomeStr.contains("Under $25,000")) annualIncome = 12500.0;
                }
            }

            // Create security questions JSON
            String securityQuestionsJson = String.format(
                "[{\"question\":\"%s\",\"answer\":\"%s\"},{\"question\":\"%s\",\"answer\":\"%s\"},{\"question\":\"%s\",\"answer\":\"%s\"}]",
                securityQuestion1 != null ? securityQuestion1 : "",
                securityAnswer1 != null ? securityAnswer1 : "",
                securityQuestion2 != null ? securityQuestion2 : "",
                securityAnswer2 != null ? securityAnswer2 : "",
                securityQuestion3 != null ? securityQuestion3 : "",
                securityAnswer3 != null ? securityAnswer3 : ""
            );

            // Submit verification
            @SuppressWarnings("unused")
            USVerification verification = usVerificationService.submitVerification(
                email, firstName, lastName, phone, dateOfBirth.atStartOfDay(), ssn,
                birthCity, birthState, birthCountry,
                addressLine1, addressLine2, city, state, zipCode, country,
                employmentStatus, annualIncomeStr, sourceOfFunds, riskTolerance, taxBracket,
                password, securityQuestionsJson
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", "PENDING_REVIEW");
            response.put("message", "Your application is pending review. You will be notified once approved.");
            response.put("email", email);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
        }
    }
 
    /**
     * Check if user has pending verification
     * GET /auth/us-verification/status/{email}
     */
    @GetMapping("/status/{email}")
    public ResponseEntity<?> checkStatus(@PathVariable String email) {
        try {
            boolean hasPending = usVerificationService.hasPendingVerification(email);
            return ResponseEntity.ok(Map.of("hasPending", hasPending));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

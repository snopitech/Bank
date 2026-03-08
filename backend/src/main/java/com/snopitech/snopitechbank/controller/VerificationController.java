package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.DocumentVerificationRequest;
import com.snopitech.snopitechbank.model.PendingVerification;
import com.snopitech.snopitechbank.service.DocumentVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    @Autowired
    private DocumentVerificationService documentVerificationService;

    /**
     * Upload document for verification (non-US citizens)
     */
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("userId") Long userId,
            @RequestParam("documentType") String documentType,
            @RequestParam("document") MultipartFile document,
            @RequestParam(value = "documentNumber", required = false) String documentNumber,
            @RequestParam(value = "issuingCountry", required = false) String issuingCountry,
            @RequestParam(value = "expiryDate", required = false) String expiryDate) {
        
        try {
            // Build request DTO
            DocumentVerificationRequest request = new DocumentVerificationRequest();
            request.setUserId(userId.toString());
            request.setDocumentType(documentType);
            request.setDocument(document);
            request.setDocumentNumber(documentNumber);
            request.setIssuingCountry(issuingCountry);
            if (expiryDate != null && !expiryDate.isEmpty()) {
                request.setExpiryDate(LocalDate.parse(expiryDate));
            }
            
            // Process verification
            PendingVerification result = documentVerificationService.processDocumentVerification(request, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document uploaded successfully");
            response.put("verificationId", result.getId());
            response.put("status", result.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Check verification status for a user
     */
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getVerificationStatus(@PathVariable Long userId) {
        try {
            // You'll need to add this method to your service
            // For now, returning mock response
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("status", "PENDING_REVIEW"); // or "VERIFIED", "REJECTED"
            response.put("message", "Your document is pending admin review");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error checking status");
        }
    }

    /**
     * Get document details (for admin panel)
     */
    @GetMapping("/document/{verificationId}")
    public ResponseEntity<?> getDocument(@PathVariable Long verificationId) {
        try {
            PendingVerification verification = documentVerificationService.getPendingVerification(verificationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", verification.getId());
            response.put("userId", verification.getUserId());
            response.put("documentType", verification.getDocumentType());
            response.put("documentFileName", verification.getDocumentFileName());
            response.put("documentContentType", verification.getDocumentContentType());
            response.put("fileSize", verification.getFileSizeAsString());
            response.put("status", verification.getStatus());
            response.put("submittedAt", verification.getSubmittedAt());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download document image (for admin review)
     */
    @GetMapping("/document/{verificationId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long verificationId) {
        try {
            PendingVerification verification = documentVerificationService.getPendingVerification(verificationId);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + verification.getDocumentFileName() + "\"")
                .contentType(MediaType.parseMediaType(verification.getDocumentContentType()))
                .body(verification.getDocumentData());
                
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ⭐ ADMIN ENDPOINTS (these will be in a separate controller later)
    
    /**
     * Test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Verification controller is working!");
    }
}
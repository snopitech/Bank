package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.DocumentVerificationRequest;
import com.snopitech.snopitechbank.model.PendingVerification;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.PendingVerificationRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentVerificationService {

    @Autowired
    private PendingVerificationRepository pendingVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${trulioo.api.key:sandbox-key}")
    private String truliooApiKey;

    @Value("${trulioo.api.url:https://sandbox.trulioo.com}")
    private String truliooApiUrl;

    @Value("${trulioo.mode:sandbox}")
    private String truliooMode;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
        "image/jpeg", "image/jpg", "image/png", "application/pdf"
    };

    /**
     * Process document verification for non-US citizens
     */
    @Transactional
    public PendingVerification processDocumentVerification(DocumentVerificationRequest request, Long userId) {
        // Validate the document
        validateDocument(request.getDocument());
        
        try {
            // Create pending verification record
            PendingVerification pendingVerification = new PendingVerification();
            pendingVerification.setUserId(userId);
            pendingVerification.setDocumentType(request.getDocumentType());
            pendingVerification.setDocumentNumber(request.getDocumentNumber());
            pendingVerification.setIssuingCountry(request.getIssuingCountry());
            pendingVerification.setExpiryDate(request.getExpiryDate());
            
            // Store document as BLOB
            pendingVerification.setDocumentData(request.getDocument().getBytes());
            pendingVerification.setDocumentFileName(request.getDocument().getOriginalFilename());
            pendingVerification.setDocumentContentType(request.getDocument().getContentType());
            
            // Generate transaction ID for tracking
            String transactionId = generateTransactionId();
            pendingVerification.setTransactionId(transactionId);
            
            // Call Trulioo API (sandbox or production)
            String truliooResponse = callTruliooVerification(request, transactionId);
            pendingVerification.setTruliooResponse(truliooResponse);
            
            // Parse response and determine status
            String verificationStatus = parseTruliooResponse(truliooResponse);
            
            if ("ACCEPTED".equals(verificationStatus)) {
                // Auto-approve
                pendingVerification.setStatus("APPROVED");
                updateUserVerificationStatus(userId, true);
            } else {
                // Send to admin review
                pendingVerification.setStatus("PENDING_REVIEW");
            }
            
            return pendingVerificationRepository.save(pendingVerification);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to process document upload", e);
        }
    }

    /**
     * Validate the uploaded document
     */
    private void validateDocument(MultipartFile document) {
        if (document == null || document.isEmpty()) {
            throw new IllegalArgumentException("Document is required");
        }
        
        if (document.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed (10MB)");
        }
        
        String contentType = document.getContentType();
        boolean isValidType = false;
        for (String allowedType : ALLOWED_CONTENT_TYPES) {
            if (allowedType.equals(contentType)) {
                isValidType = true;
                break;
            }
        }
        
        if (!isValidType) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, PDF");
        }
    }

    /**
     * Call Trulioo API for verification
     */
    private String callTruliooVerification(DocumentVerificationRequest request, String transactionId) {
        // This is where you'd make the actual Trulioo API call
        // For now, returning mock response based on mode
        
        if ("sandbox".equals(truliooMode)) {
            // Sandbox mode - simulate response
            return simulateTruliooResponse(request, transactionId);
        } else {
            // Production mode - actual API call
            // return actualTruliooApiCall(request, transactionId);
            throw new UnsupportedOperationException("Production mode not yet implemented");
        }
    }

    /**
     * Simulate Trulioo response for sandbox testing
     */
    private String simulateTruliooResponse(DocumentVerificationRequest request, String transactionId) {
        // In sandbox mode, we can simulate different responses
        // For testing, you can make this configurable
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("timestamp", LocalDateTime.now().toString());
        
        // Simulate based on document type or other criteria
        if ("PASSPORT".equals(request.getDocumentType())) {
            response.put("status", "ACCEPTED");
            response.put("message", "Document verified successfully");
        } else {
            response.put("status", "REVIEW");
            response.put("message", "Manual review required");
            response.put("indicators", new String[]{"Document quality", "Expiry date unclear"});
        }
        
        return response.toString(); // In real code, use JSON library
    }

    /**
     * Parse Trulioo response to get verification status
     */
    private String parseTruliooResponse(String response) {
        // In real code, parse JSON response
        // For now, simple simulation
        if (response.contains("ACCEPTED")) {
            return "ACCEPTED";
        } else if (response.contains("REVIEW")) {
            return "REVIEW";
        } else {
            return "FAILED";
        }
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Update user's verification status
     */
    private void updateUserVerificationStatus(Long userId, boolean verified) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // You may need to add a verificationStatus field to User model
        // user.setVerificationStatus(verified ? "VERIFIED" : "PENDING");
        userRepository.save(user);
    }

    /**
     * Get pending verification by ID (for admin review)
     */
    @Transactional(readOnly = true)
    public PendingVerification getPendingVerification(Long id) {
        return pendingVerificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pending verification not found"));
    }

    /**
     * Approve a pending verification (admin action)
     */
    @Transactional
    public void approveVerification(Long id, String adminUsername) {
        PendingVerification pending = getPendingVerification(id);
        pending.approve(adminUsername);
        pendingVerificationRepository.save(pending);
        
        // Update user status
        updateUserVerificationStatus(pending.getUserId(), true);
    }

    /**
     * Reject a pending verification (admin action)
     */
    @Transactional
    public void rejectVerification(Long id, String adminUsername, String notes) {
        PendingVerification pending = getPendingVerification(id);
        pending.reject(adminUsername, notes);
        pendingVerificationRepository.save(pending);
        
        // Update user status
        updateUserVerificationStatus(pending.getUserId(), false);
    }
}
package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.ApiResponse;
import com.snopitech.snopitechbank.dto.InquiryRequest;
import com.snopitech.snopitechbank.dto.InquiryResponse;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.InquiryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {
    
    private static final Logger logger = LoggerFactory.getLogger(InquiryController.class);
    
    private final InquiryService inquiryService;
    
    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }
    
    /**
     * PUBLIC ENDPOINT: Create inquiry (for non-logged-in users)
     */
    @PostMapping("/public")
    public ResponseEntity<ApiResponse> createPublicInquiry(
            @Valid @RequestBody InquiryRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Get client IP and User-Agent
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Create inquiry
            InquiryResponse response = inquiryService.createInquiry(request, ipAddress, userAgent);
            
            logger.info("Public inquiry created: {} from IP: {}", 
                response.getReferenceNumber(), ipAddress);
            
            return ResponseEntity.ok(
                new ApiResponse(true, "Inquiry submitted successfully. Reference: " + 
                    response.getReferenceNumber(), response)
            );
            
        } catch (Exception e) {
            logger.error("Error creating public inquiry", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Failed to submit inquiry: " + e.getMessage()));
        }
    }
    
    /**
     * USER ENDPOINT: Create inquiry (for logged-in users)
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createUserInquiry(
            @Valid @RequestBody InquiryRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        
        try {
            // Get client IP and User-Agent
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Create inquiry with user info
            InquiryResponse response = inquiryService.createUserInquiry(
                request, user, ipAddress, userAgent);
            
            logger.info("User inquiry created: {} for user: {}", 
                response.getReferenceNumber(), user.getEmail());
            
            return ResponseEntity.ok(
                new ApiResponse(true, "Inquiry submitted successfully. Reference: " + 
                    response.getReferenceNumber(), response)
            );
            
        } catch (Exception e) {
            logger.error("Error creating user inquiry for user: {}", user.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Failed to submit inquiry: " + e.getMessage()));
        }
    }
    
    /**
     * Get inquiry by reference number (public access with reference)
     */
    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<ApiResponse> getInquiryByReference(
            @PathVariable String referenceNumber) {
        
        try {
            InquiryResponse response = inquiryService.getInquiryByReference(referenceNumber);
            return ResponseEntity.ok(
                new ApiResponse(true, "Inquiry found", response)
            );
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching inquiry: {}", referenceNumber, e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error fetching inquiry"));
        }
    }
    
    /**
     * USER ENDPOINT: Get user's inquiries (authenticated users only)
     */
    @GetMapping("/my-inquiries")
    public ResponseEntity<ApiResponse> getMyInquiries(
            @AuthenticationPrincipal User user) {
        
        try {
            List<InquiryResponse> inquiries = inquiryService.getUserInquiries(user.getId());
            
            return ResponseEntity.ok(
                new ApiResponse(true, 
                    inquiries.isEmpty() ? "No inquiries found" : "Inquiries retrieved successfully",
                    inquiries)
            );
            
        } catch (Exception e) {
            logger.error("Error fetching inquiries for user: {}", user.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error fetching your inquiries"));
        }
    }
    
    /**
     * Get inquiry statistics (for dashboard - could be public or admin later)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStatistics() {
        try {
            InquiryService.InquiryStats stats = inquiryService.getStatistics();
            return ResponseEntity.ok(
                new ApiResponse(true, "Statistics retrieved", stats)
            );
            
        } catch (Exception e) {
            logger.error("Error fetching inquiry statistics", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error fetching statistics"));
        }
    }
    
    /**
     * Check inquiry status by reference (public)
     */
    @GetMapping("/status/{referenceNumber}")
    public ResponseEntity<ApiResponse> checkStatus(
            @PathVariable String referenceNumber) {
        
        try {
            InquiryResponse response = inquiryService.getInquiryByReference(referenceNumber);
            
            // Return minimal info for status check
            ApiResponse statusResponse = new ApiResponse(true, 
                "Inquiry status: " + response.getStatus(),
                new StatusCheckResponse(
                    response.getReferenceNumber(),
                    response.getStatus(),
                    response.getCreatedAt(),
                    response.getUpdatedAt()
                )
            );
            
            return ResponseEntity.ok(statusResponse);
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error checking status for: {}", referenceNumber, e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error checking inquiry status"));
        }
    }
    
    /**
     * Helper method to get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // Handle multiple IPs (load balancer)
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "0.0.0.0";
    }
    
    /**
     * Inner class for status check response
     */
    private static class StatusCheckResponse {
        private String referenceNumber;
        private String status;
        private String createdAt;
        private String updatedAt;
        
        public StatusCheckResponse(String referenceNumber, String status, 
                                  java.time.LocalDateTime createdAt, 
                                  java.time.LocalDateTime updatedAt) {
            this.referenceNumber = referenceNumber;
            this.status = status;
            this.createdAt = createdAt.toString();
            this.updatedAt = updatedAt.toString();
        }
        
        // Getters
        @SuppressWarnings("unused")
        public String getReferenceNumber() { return referenceNumber; }
        @SuppressWarnings("unused")
        public String getStatus() { return status; }
        @SuppressWarnings("unused")
        public String getCreatedAt() { return createdAt; }
        @SuppressWarnings("unused")
        public String getUpdatedAt() { return updatedAt; }
    }
}

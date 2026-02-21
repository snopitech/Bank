package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.InquiryRequest;
import com.snopitech.snopitechbank.dto.InquiryResponse;
import com.snopitech.snopitechbank.model.Inquiry;
import com.snopitech.snopitechbank.model.User;

import java.util.List;

public interface InquiryService {
    
    /**
     * Create a new inquiry (for both logged-in and public users)
     */
    InquiryResponse createInquiry(InquiryRequest request, String ipAddress, String userAgent);
    
    /**
     * Create inquiry for logged-in user (auto-fills user info)
     */
    InquiryResponse createUserInquiry(InquiryRequest request, User user, String ipAddress, String userAgent);
    
    /**
     * Get inquiry by reference number
     */
    InquiryResponse getInquiryByReference(String referenceNumber);
    
    /**
     * Get all inquiries for a specific user
     */
    List<InquiryResponse> getUserInquiries(Long userId);
    
    /**
     * Get all inquiries for a specific email
     */
    List<InquiryResponse> getInquiriesByEmail(String email);
    
    /**
     * Update inquiry status
     */
    InquiryResponse updateStatus(Long inquiryId, String status);
    
    /**
     * Update inquiry priority
     */
    InquiryResponse updatePriority(Long inquiryId, String priority);
    
    /**
     * Get inquiry statistics
     */
    InquiryStats getStatistics();
    
    /**
     * Generate next reference number
     */
    String generateReferenceNumber();
    
    /**
     * Convert Inquiry entity to InquiryResponse DTO
     */
    InquiryResponse convertToResponse(Inquiry inquiry);
    
    // Statistics DTO
    class InquiryStats {
        private long totalInquiries;
        private long openInquiries;
        private long inProgressInquiries;
        private long resolvedInquiries;
        private long urgentInquiries;
        
        // Getters and Setters
        public long getTotalInquiries() { return totalInquiries; }
        public void setTotalInquiries(long totalInquiries) { this.totalInquiries = totalInquiries; }
        
        public long getOpenInquiries() { return openInquiries; }
        public void setOpenInquiries(long openInquiries) { this.openInquiries = openInquiries; }
        
        public long getInProgressInquiries() { return inProgressInquiries; }
        public void setInProgressInquiries(long inProgressInquiries) { this.inProgressInquiries = inProgressInquiries; }
        
        public long getResolvedInquiries() { return resolvedInquiries; }
        public void setResolvedInquiries(long resolvedInquiries) { this.resolvedInquiries = resolvedInquiries; }
        
        public long getUrgentInquiries() { return urgentInquiries; }
        public void setUrgentInquiries(long urgentInquiries) { this.urgentInquiries = urgentInquiries; }
    }
}

package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.InquiryRequest;
import com.snopitech.snopitechbank.dto.InquiryResponse;
import com.snopitech.snopitechbank.model.Inquiry;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.InquiryRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InquiryServiceImpl implements InquiryService {
    
    private static final Logger logger = LoggerFactory.getLogger(InquiryServiceImpl.class);
    
    private final InquiryRepository inquiryRepository;
    private final InquiryEmailService inquiryEmailService;
    
    public InquiryServiceImpl(InquiryRepository inquiryRepository, 
                             InquiryEmailService inquiryEmailService) {
        this.inquiryRepository = inquiryRepository;
        this.inquiryEmailService = inquiryEmailService;
    }
    
    @Override
    public InquiryResponse createInquiry(InquiryRequest request, String ipAddress, String userAgent) {
        try {
            // Generate reference number
            String referenceNumber = generateReferenceNumber();
            
            // Create inquiry entity
            Inquiry inquiry = new Inquiry();
            inquiry.setReferenceNumber(referenceNumber);
            inquiry.setFullName(request.getFullName());
            inquiry.setEmail(request.getEmail());
            inquiry.setPhone(request.getPhone());
            inquiry.setCategory(request.getCategory());
            inquiry.setSubject(request.getSubject());
            inquiry.setMessage(request.getMessage());
            inquiry.setAccountNumber(request.getAccountNumber());
            inquiry.setIpAddress(ipAddress);
            inquiry.setUserAgent(userAgent);
            
            // Set priority based on category
            String priority = determinePriority(request.getCategory());
            inquiry.setPriority(priority);
            
            // Save to database
            Inquiry savedInquiry = inquiryRepository.save(inquiry);
            logger.info("Inquiry created: {} for {}", referenceNumber, request.getEmail());
            
            // Send emails (async would be better, but synchronous for Phase 1)
            try {
                // Send auto-response to user
                inquiryEmailService.sendAutoResponse(savedInquiry);
                savedInquiry.setAutoResponseSent(true);
                
                // Send notification to admin
                inquiryEmailService.sendAdminNotification(savedInquiry);
                savedInquiry.setAdminNotificationSent(true);
                
                inquiryRepository.save(savedInquiry);
            } catch (Exception e) {
                logger.error("Failed to send emails for inquiry: {}", referenceNumber, e);
                // Don't fail the whole request if email fails
            }
            
            return convertToResponse(savedInquiry);
            
        } catch (Exception e) {
            logger.error("Error creating inquiry", e);
            throw new RuntimeException("Failed to create inquiry: " + e.getMessage());
        }
    }
    
    @Override
    public InquiryResponse createUserInquiry(InquiryRequest request, User user, String ipAddress, String userAgent) {
        try {
            // Generate reference number
            String referenceNumber = generateReferenceNumber();
            
            // Create inquiry entity with user info
            Inquiry inquiry = new Inquiry();
            inquiry.setReferenceNumber(referenceNumber);
            inquiry.setUser(user);
            inquiry.setFullName(user.getFullName()); // Use user's full name
            inquiry.setEmail(user.getEmail()); // Use user's email
            inquiry.setPhone(request.getPhone() != null ? request.getPhone() : user.getPhone());
            inquiry.setCategory(request.getCategory());
            inquiry.setSubject(request.getSubject());
            inquiry.setMessage(request.getMessage());
            inquiry.setAccountNumber(request.getAccountNumber());
            inquiry.setIpAddress(ipAddress);
            inquiry.setUserAgent(userAgent);
            
            // Set priority based on category
            String priority = determinePriority(request.getCategory());
            inquiry.setPriority(priority);
            
            // Save to database
            Inquiry savedInquiry = inquiryRepository.save(inquiry);
            logger.info("Inquiry created for user {}: {}", user.getEmail(), referenceNumber);
            
            // Send emails
            try {
                inquiryEmailService.sendAutoResponse(savedInquiry);
                savedInquiry.setAutoResponseSent(true);
                
                inquiryEmailService.sendAdminNotification(savedInquiry);
                savedInquiry.setAdminNotificationSent(true);
                
                inquiryRepository.save(savedInquiry);
            } catch (Exception e) {
                logger.error("Failed to send emails for inquiry: {}", referenceNumber, e);
            }
            
            return convertToResponse(savedInquiry);
            
        } catch (Exception e) {
            logger.error("Error creating user inquiry", e);
            throw new RuntimeException("Failed to create inquiry: " + e.getMessage());
        }
    }
    
    @Override
    public InquiryResponse getInquiryByReference(String referenceNumber) {
        Inquiry inquiry = inquiryRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Inquiry not found: " + referenceNumber));
        return convertToResponse(inquiry);
    }
    
    @Override
    public List<InquiryResponse> getUserInquiries(Long userId) {
        List<Inquiry> inquiries = inquiryRepository.findByUserId(userId);
        return inquiries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<InquiryResponse> getInquiriesByEmail(String email) {
        List<Inquiry> inquiries = inquiryRepository.findByEmail(email);
        return inquiries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public InquiryResponse updateStatus(Long inquiryId, String status) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found with id: " + inquiryId));
        
        inquiry.setStatus(status);
        if ("RESOLVED".equals(status)) {
            inquiry.setResolvedAt(LocalDateTime.now());
        }
        
        Inquiry updatedInquiry = inquiryRepository.save(inquiry);
        return convertToResponse(updatedInquiry);
    }
    
    @Override
    public InquiryResponse updatePriority(Long inquiryId, String priority) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found with id: " + inquiryId));
        
        inquiry.setPriority(priority);
        Inquiry updatedInquiry = inquiryRepository.save(inquiry);
        return convertToResponse(updatedInquiry);
    }
    
    @Override
    public InquiryStats getStatistics() {
        InquiryStats stats = new InquiryStats();
        stats.setTotalInquiries(inquiryRepository.count());
        stats.setOpenInquiries(inquiryRepository.countByStatus("OPEN"));
        stats.setInProgressInquiries(inquiryRepository.countByStatus("IN_PROGRESS"));
        stats.setResolvedInquiries(inquiryRepository.countByStatus("RESOLVED"));
        stats.setUrgentInquiries(inquiryRepository.countByPriority("URGENT"));
        return stats;
    }
    
    @Override
    public String generateReferenceNumber() {
        // Format: INQ-YYYY-XXXX (e.g., INQ-2024-0001)
        int currentYear = Year.now().getValue();
        
        // Find the highest reference number for this year
        List<Inquiry> thisYearInquiries = inquiryRepository.findByCreatedAtBetween(
            LocalDateTime.of(currentYear, 1, 1, 0, 0),
            LocalDateTime.of(currentYear, 12, 31, 23, 59, 59)
        );
        
        // Find max sequence number
        int maxSequence = 0;
        for (Inquiry inquiry : thisYearInquiries) {
            String ref = inquiry.getReferenceNumber();
            if (ref != null && ref.startsWith("INQ-" + currentYear + "-")) {
                try {
                    String seqStr = ref.substring(ref.lastIndexOf("-") + 1);
                    int seq = Integer.parseInt(seqStr);
                    if (seq > maxSequence) {
                        maxSequence = seq;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid format
                }
            }
        }
        
        // Increment and format
        int nextSequence = maxSequence + 1;
        return String.format("INQ-%d-%04d", currentYear, nextSequence);
    }
    
    @Override
    public InquiryResponse convertToResponse(Inquiry inquiry) {
        InquiryResponse response = new InquiryResponse();
        response.setId(inquiry.getId());
        response.setReferenceNumber(inquiry.getReferenceNumber());
        response.setFullName(inquiry.getFullName());
        response.setEmail(inquiry.getEmail());
        response.setPhone(inquiry.getPhone());
        response.setCategory(inquiry.getCategory());
        response.setSubject(inquiry.getSubject());
        response.setMessage(inquiry.getMessage());
        response.setStatus(inquiry.getStatus());
        response.setPriority(inquiry.getPriority());
        response.setAccountNumber(inquiry.getAccountNumber());
        response.setCreatedAt(inquiry.getCreatedAt());
        response.setUpdatedAt(inquiry.getUpdatedAt());
        response.setAutoResponseSent(inquiry.isAutoResponseSent());
        return response;
    }
    
    /**
     * Determine priority based on category
     */
    private String determinePriority(String category) {
        switch (category) {
            case "FRAUD_SECURITY":
                return "URGENT";
            case "ACCOUNT_ISSUE":
            case "CARD_ISSUE":
                return "HIGH";
            case "LOAN_APPLICATION":
                return "NORMAL";
            case "TECHNICAL_SUPPORT":
            case "GENERAL_INQUIRY":
            case "FEEDBACK_SUGGESTION":
            default:
                return "NORMAL";
        }
    }
}

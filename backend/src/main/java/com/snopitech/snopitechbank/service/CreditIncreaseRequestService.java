package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditIncreaseRequest;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditIncreaseRequestRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class CreditIncreaseRequestService {

    @Autowired
    private CreditIncreaseRequestRepository increaseRequestRepository;

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService; // ADD THIS

    // Helper method to populate employment info from user
    private void populateEmploymentInfoFromUser(CreditIncreaseRequest request, User user) {
        if (user.getEmploymentStatus() != null) {
            request.setEmploymentStatus(user.getEmploymentStatus());
        } else {
            request.setEmploymentStatus("NOT_SPECIFIED"); // Default value
        }
        
        if (user.getAnnualIncome() != null) {
            request.setAnnualIncome(user.getAnnualIncome());
        }
        
        // You can add more fields as needed
        // request.setEmployerName(user.getEmployerName());
        // request.setYearsAtEmployer(user.getYearsAtEmployer());
    }

    // Submit increase request
    @Transactional
    public CreditIncreaseRequest submitIncreaseRequest(Long accountId, Long userId, 
                                                       Double requestedLimit, String reason) {
        CreditAccount account = creditAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify account belongs to user
        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Account does not belong to this user");
        }

        // Check if account is active
        if (!account.isActive()) {
            throw new RuntimeException("Account is not active");
        }

        // Check if account can request increase
        if (!account.canRequestIncrease()) {
            throw new RuntimeException("Account has already reached maximum limit of $20,000");
        }

        // Check if requested limit is valid
        Double nextLimit = account.getNextLimit();
        if (!requestedLimit.equals(nextLimit)) {
            throw new RuntimeException("Invalid increase request. Next eligible limit is: $" + nextLimit);
        }

        // Check for existing pending request
        if (increaseRequestRepository.existsByCreditAccountIdAndStatus(accountId, "PENDING")) {
            throw new RuntimeException("Account already has a pending increase request");
        }

        CreditIncreaseRequest request = new CreditIncreaseRequest(account, user, requestedLimit, reason);
        
        // Populate employment info from user
        populateEmploymentInfoFromUser(request, user);
        
        return increaseRequestRepository.save(request);
    }

    // Get request by ID
    public CreditIncreaseRequest getRequest(Long id) {
        return increaseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Increase request not found"));
    }

    // Get user's increase requests
    public List<CreditIncreaseRequest> getUserRequests(Long userId) {
        return increaseRequestRepository.findByUserId(userId);
    }

    // Get account's increase requests
    public List<CreditIncreaseRequest> getAccountRequests(Long accountId) {
        return increaseRequestRepository.findByCreditAccountIdOrderBySubmittedDateDesc(accountId);
    }

    // Get pending requests (admin)
    public List<CreditIncreaseRequest> getPendingRequests() {
        return increaseRequestRepository.findByStatusOrderBySubmittedDateDesc("PENDING");
    }

    // Get requests pending document verification
    public List<CreditIncreaseRequest> getRequestsPendingDocumentVerification() {
        return increaseRequestRepository.findRequestsPendingDocumentVerification();
    }

    // Approve increase request
    @Transactional
    public CreditAccount approveIncreaseRequest(Long requestId, String adminUsername) {
        CreditIncreaseRequest request = getRequest(requestId);
        
        if (!request.isPending()) {
            throw new RuntimeException("Request is not pending");
        }

        CreditAccount account = request.getCreditAccount();
        User user = request.getUser();

        // Update account limit
        Double newLimit = request.getRequestedLimit();
        Double oldLimit = account.getCreditLimit();
        account.setCreditLimit(newLimit);
        account.setIncreaseCount(account.getIncreaseCount() + 1);

        // Update request
        request.setStatus("APPROVED");
        request.setReviewedBy(adminUsername);
        request.setReviewedDate(LocalDateTime.now());

        // Save both
        increaseRequestRepository.save(request);
        creditAccountRepository.save(account);

        // ==================== SEND APPROVAL EMAIL ====================
        try {
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String accountNumber = account.getMaskedAccountNumber();
            
            String subject = "✅ Your Credit Limit Increase Has Been Approved!";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }" +
                ".header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }" +
                ".content { padding: 30px; }" +
                ".details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                ".limit-box { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px; margin: 10px 0; border: 1px solid #e0e0e0; }" +
                ".old-limit { text-decoration: line-through; color: #ef4444; font-size: 18px; }" +
                ".new-limit { color: #22c55e; font-size: 24px; font-weight: bold; }" +
                ".arrow { font-size: 24px; margin: 0 15px; color: #666; }" +
                ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; }" +
                ".button { background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Congratulations " + userName + "!</h1>" +
                "<p>Your credit limit increase request has been approved</p>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>Great news! Your request to increase your credit limit has been reviewed and <strong style='color: #22c55e;'>APPROVED</strong>.</p>" +
                
                "<div class='details'>" +
                "<h3 style='margin-top: 0;'>📋 Account Details</h3>" +
                "<p><strong>Account Number:</strong> " + accountNumber + "</p>" +
                "<div class='limit-box'>" +
                "<div><span style='color: #666;'>Previous Limit</span><div class='old-limit'>$" + String.format("%,.2f", oldLimit) + "</div></div>" +
                "<span class='arrow'>→</span>" +
                "<div><span style='color: #666;'>New Limit</span><div class='new-limit'>$" + String.format("%,.2f", newLimit) + "</div></div>" +
                "</div>" +
                "</div>" +
                
                "<h3>✅ What This Means:</h3>" +
                "<ul>" +
                "<li>Your new credit limit is now available for use</li>" +
                "<li>You have more purchasing power for larger expenses</li>" +
                "<li>Your credit utilization ratio will improve</li>" +
                "<li>You may be eligible for better rewards</li>" +
                "</ul>" +
                
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:5173/dashboard' class='button'>View Your Account</a>" +
                "</div>" +
                
                "<p style='margin-top: 30px;'>Thank you for being a valued Snopitech Bank customer!</p>" +
                "<p>If you have any questions, please contact us:</p>" +
                "<p>📞 +1 (713) 870-1132<br>📧 snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "<p style='font-size: 12px;'>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            
            System.out.println("✅ Credit limit increase approval email sent to: " + userEmail);
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send credit limit increase approval email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return account;
    }

    // Reject increase request
    @Transactional
    public CreditIncreaseRequest rejectIncreaseRequest(Long requestId, String adminUsername, 
                                                       String rejectionReason, String adminNotes) {
        CreditIncreaseRequest request = getRequest(requestId);
        User user = request.getUser();
        
        if (!request.isPending()) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus("REJECTED");
        request.setReviewedBy(adminUsername);
        request.setReviewedDate(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);
        request.setAdminNotes(adminNotes);

        CreditIncreaseRequest savedRequest = increaseRequestRepository.save(request);

        // ==================== SEND REJECTION EMAIL ====================
        try {
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String accountNumber = request.getCreditAccount().getMaskedAccountNumber();
            
            String subject = "❌ Update on Your Credit Limit Increase Request";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }" +
                ".header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }" +
                ".content { padding: 30px; }" +
                ".details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                ".reason-box { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }" +
                ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; }" +
                ".button { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Credit Limit Increase Request Update</h1>" +
                "<p>We've completed our review of your request</p>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>We have carefully reviewed your request to increase the credit limit on account <strong>" + accountNumber + "</strong>.</p>" +
                
                "<div class='reason-box'>" +
                "<h3 style='margin-top: 0; color: #991b1b;'>📋 Review Outcome</h3>" +
                "<p>After careful consideration, we are unable to approve your request at this time.</p>" +
                "<p><strong>Reason:</strong> " + rejectionReason + "</p>" +
                "</div>" +
                
                "<h3>💡 What You Can Do:</h3>" +
                "<ul>" +
                "<li>Continue using your account responsibly</li>" +
                "<li>Make all payments on time</li>" +
                "<li>Keep your balance low relative to your limit</li>" +
                "<li>You may reapply in 3-6 months</li>" +
                "</ul>" +
                
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:5173/dashboard' class='button'>Go to Dashboard</a>" +
                "</div>" +
                
                "<p style='margin-top: 30px;'>If you have questions about this decision, please contact us:</p>" +
                "<p>📞 +1 (713) 870-1132<br>📧 snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "<p style='font-size: 12px;'>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            
            System.out.println("✅ Credit limit increase rejection email sent to: " + userEmail);
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send credit limit increase rejection email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return savedRequest;
    }

    // Update request with credit check info (admin)
    @Transactional
    public CreditIncreaseRequest updateCreditCheckInfo(Long requestId, Integer creditScore, 
                                                       Boolean creditCheckPerformed) {
        CreditIncreaseRequest request = getRequest(requestId);
        
        request.setCreditScore(creditScore);
        request.setCreditCheckPerformed(creditCheckPerformed);
        request.setCreditCheckDate(LocalDateTime.now());

        return increaseRequestRepository.save(request);
    }

    // Update request with document verification (admin)
    @Transactional
    public CreditIncreaseRequest verifyDocuments(Long requestId, Boolean verified, String documentPath) {
        CreditIncreaseRequest request = getRequest(requestId);
        
        request.setDocumentsVerified(verified);
        if (documentPath != null) {
            request.setDocumentPath(documentPath);
        }

        return increaseRequestRepository.save(request);
    }

    // Update employment and income info (customer)
    @Transactional
    public CreditIncreaseRequest updateEmploymentInfo(Long requestId, String employmentStatus,
                                                      Double annualIncome, String employerName,
                                                      Integer yearsAtEmployer) {
        CreditIncreaseRequest request = getRequest(requestId);
        
        // Verify request belongs to current user (caller should check)
        if (employmentStatus != null) {
            request.setEmploymentStatus(employmentStatus);
        }
        if (annualIncome != null) {
            request.setAnnualIncome(annualIncome);
        }
        if (employerName != null) {
            request.setEmployerName(employerName);
        }
        if (yearsAtEmployer != null) {
            request.setYearsAtEmployer(yearsAtEmployer);
        }

        return increaseRequestRepository.save(request);
    }

    // Get requests with filters (admin)
    public List<CreditIncreaseRequest> getRequestsWithFilters(String status, Long accountId) {
        return increaseRequestRepository.findRequestsWithFilters(status, accountId);
    }

    // Check if account has pending request
    public boolean hasPendingRequest(Long accountId) {
        return increaseRequestRepository.existsByCreditAccountIdAndStatus(accountId, "PENDING");
    }

        // Convert single request to DTO
public CreditIncreaseRequestDTO convertToDTO(CreditIncreaseRequest request) {
    return new CreditIncreaseRequestDTO(request);
}

// Convert list of requests to DTOs
public List<CreditIncreaseRequestDTO> convertToDTOList(List<CreditIncreaseRequest> requests) {
    return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}


    // DTO for credit increase requests with user details
public static class CreditIncreaseRequestDTO {
    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String userPhone;
    private Long creditAccountId;
    private String maskedAccountNumber;
    private Double currentLimit;
    private Double requestedLimit;
    private String reason;
    private String status;
    private LocalDateTime submittedDate;
    private LocalDateTime reviewedDate;
    private String reviewedBy;
    private String rejectionReason;
    private String adminNotes;
    private String employmentStatus;
    private Double annualIncome;
    private String employerName;
    private Integer yearsAtEmployer;
    private Integer creditScore;
    private Boolean creditCheckPerformed;
    private LocalDateTime creditCheckDate;
    private Boolean documentsVerified;
    private String documentPath;

    // Constructor
    public CreditIncreaseRequestDTO(CreditIncreaseRequest request) {
        this.id = request.getId();
        
        // User details
        User user = request.getUser();
        if (user != null) {
            this.userId = user.getId();
            this.userFirstName = user.getFirstName();
            this.userLastName = user.getLastName();
            this.userEmail = user.getEmail();
            this.userPhone = user.getPhone();
        }
        
        // Account details
        CreditAccount account = request.getCreditAccount();
        if (account != null) {
            this.creditAccountId = account.getId();
            this.maskedAccountNumber = account.getMaskedAccountNumber();
            this.currentLimit = request.getCurrentLimit();
        }
        
        this.requestedLimit = request.getRequestedLimit();
        this.reason = request.getReason();
        this.status = request.getStatus();
        this.submittedDate = request.getSubmittedDate();
        this.reviewedDate = request.getReviewedDate();
        this.reviewedBy = request.getReviewedBy();
        this.rejectionReason = request.getRejectionReason();
        this.adminNotes = request.getAdminNotes();
        this.employmentStatus = request.getEmploymentStatus();
        this.annualIncome = request.getAnnualIncome();
        this.employerName = request.getEmployerName();
        this.yearsAtEmployer = request.getYearsAtEmployer();
        this.creditScore = request.getCreditScore();
        this.creditCheckPerformed = request.getCreditCheckPerformed();
        this.creditCheckDate = request.getCreditCheckDate();
        this.documentsVerified = request.getDocumentsVerified();
        this.documentPath = request.getDocumentPath();
    }



    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserFirstName() { return userFirstName; }
    public String getUserLastName() { return userLastName; }
    public String getUserEmail() { return userEmail; }
    public String getUserPhone() { return userPhone; }
    public Long getCreditAccountId() { return creditAccountId; }
    public String getMaskedAccountNumber() { return maskedAccountNumber; }
    public Double getCurrentLimit() { return currentLimit; }
    public Double getRequestedLimit() { return requestedLimit; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public LocalDateTime getSubmittedDate() { return submittedDate; }
    public LocalDateTime getReviewedDate() { return reviewedDate; }
    public String getReviewedBy() { return reviewedBy; }
    public String getRejectionReason() { return rejectionReason; }
    public String getAdminNotes() { return adminNotes; }
    public String getEmploymentStatus() { return employmentStatus; }
    public Double getAnnualIncome() { return annualIncome; }
    public String getEmployerName() { return employerName; }
    public Integer getYearsAtEmployer() { return yearsAtEmployer; }
    public Integer getCreditScore() { return creditScore; }
    public Boolean getCreditCheckPerformed() { return creditCheckPerformed; }
    public LocalDateTime getCreditCheckDate() { return creditCheckDate; }
    public Boolean getDocumentsVerified() { return documentsVerified; }
    public String getDocumentPath() { return documentPath; }
}

    // Get request statistics (admin)
    public IncreaseRequestStatistics getRequestStatistics() {
        IncreaseRequestStatistics stats = new IncreaseRequestStatistics();
        
        stats.setTotalRequests(increaseRequestRepository.count());
        stats.setPendingRequests(increaseRequestRepository.countPendingRequests());
        stats.setApprovedRequests(increaseRequestRepository.findByStatus("APPROVED").size());
        stats.setRejectedRequests(increaseRequestRepository.findByStatus("REJECTED").size());
        stats.setRequestsPendingVerification(
            increaseRequestRepository.findRequestsPendingDocumentVerification().size()
        );
        
        return stats;
    }

    // Inner class for statistics
    public static class IncreaseRequestStatistics {
        private long totalRequests;
        private long pendingRequests;
        private long approvedRequests;
        private long rejectedRequests;
        private long requestsPendingVerification;

        // Getters and setters
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }

        public long getPendingRequests() { return pendingRequests; }
        public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

        public long getApprovedRequests() { return approvedRequests; }
        public void setApprovedRequests(long approvedRequests) { this.approvedRequests = approvedRequests; }

        public long getRejectedRequests() { return rejectedRequests; }
        public void setRejectedRequests(long rejectedRequests) { this.rejectedRequests = rejectedRequests; }

        public long getRequestsPendingVerification() { return requestsPendingVerification; }
        public void setRequestsPendingVerification(long requestsPendingVerification) { 
            this.requestsPendingVerification = requestsPendingVerification; 
        }
    }
}
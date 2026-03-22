package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.CreditApplicationRepository;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.dto.CreditApplicationDTO; // ADD THIS IMPORT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors; // ADD THIS IMPORT

@Service
public class CreditApplicationService {

    @Autowired
    private CreditApplicationRepository creditApplicationRepository;

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @SuppressWarnings("unused")
    @Autowired
    private AccountService accountService; // For generating account numbers

    // Constants
    private static final Double NEW_ACCOUNT_LIMIT = 5000.0;
    @SuppressWarnings("unused")
    private static final Double[] INCREASE_LIMITS = {10000.0, 15000.0, 20000.0};

    // Submit new credit application (original method - keep for backward compatibility)
    @Transactional
    public CreditApplication submitApplication(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a pending application
        if (creditApplicationRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            throw new RuntimeException("User already has a pending credit application");
        }

        // Check if user already has an active credit account
        if (creditAccountRepository.existsByUserIdAndStatus(userId, "ACTIVE")) {
            throw new RuntimeException("User already has an active credit account");
        }

        CreditApplication application = new CreditApplication(user, NEW_ACCOUNT_LIMIT, "NEW_ACCOUNT");
        application.setReason(reason);
        application.setIncreaseAttempt(1); // First account is 5k

        return creditApplicationRepository.save(application);
    }

    // NEW: Submit credit application with all fields
    @Transactional
    public CreditApplication submitApplication(
            Long userId, 
            String reason, 
            String creditPurpose,
            Double requestedLimit,
            Double monthlyHousingPayment,
            Integer yearsAtCurrentAddress,
            String previousAddress,
            String citizenshipStatus,
            Boolean agreeToTerms) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a pending application
        if (creditApplicationRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            throw new RuntimeException("User already has a pending credit application");
        }

        // Check if user already has an active credit account
        if (creditAccountRepository.existsByUserIdAndStatus(userId, "ACTIVE")) {
            throw new RuntimeException("User already has an active credit account");
        }

        // Use requested limit or default to 5000
        Double limit = requestedLimit != null ? requestedLimit : NEW_ACCOUNT_LIMIT;
        
      CreditApplication application = new CreditApplication(user, limit, "NEW_ACCOUNT");
application.setReason(reason);
application.setIncreaseAttempt(1); // First account is 5k

// Set new fields
application.setCreditPurpose(creditPurpose);
application.setMonthlyHousingPayment(monthlyHousingPayment);
application.setYearsAtCurrentAddress(yearsAtCurrentAddress);
application.setPreviousAddress(previousAddress);
application.setCitizenshipStatus(citizenshipStatus);
application.setAgreeToTerms(agreeToTerms);

CreditApplication savedApplication = creditApplicationRepository.save(application);

// ==================== SEND UNDER REVIEW EMAIL ====================
try {
    String userEmail = user.getEmail();
    String userName = user.getFirstName() + " " + user.getLastName();
    
    String subject = "Your SnopitechBank Credit Card Application";
    String message = String.format(
        "Dear %s,\n\n" +
        "Thank you for applying for a SnopitechBank credit card.\n\n" +
        "Your application has been submitted and is currently under review by our team. " +
        "You will receive another email once a decision has been made.\n\n" +
        "If you have any questions, please contact our support team:\n" +
        "📞 +1 (713) 870-1132\n" +
        "📧 snopitech@gmail.com\n\n" +
        "Best regards,\n" +
        "SnopitechBank Credit Team",
        userName
    );
    
    emailService.sendSimpleEmail(userEmail, subject, message);
    System.out.println("✅ Credit application under review email sent to: " + userEmail);
    
} catch (Exception e) {
    System.err.println("⚠️ Failed to send under review email: " + e.getMessage());
}
// ==================== END EMAIL ====================

return savedApplication;
    }

    // Get application by ID
    public CreditApplication getApplication(Long id) {
        return creditApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit application not found"));
    }

    // Get user's applications
    public List<CreditApplication> getUserApplications(Long userId) {
        return creditApplicationRepository.findByUserId(userId);
    }
     
    // Get user's applications by status
public List<CreditApplication> getUserApplicationsByStatus(Long userId, String status) {
    if (status != null && !status.isEmpty()) {
        return creditApplicationRepository.findByUserIdAndStatus(userId, status);
    } else {
        return creditApplicationRepository.findByUserId(userId);
    }
}


    // Get pending applications (for admin)
    public List<CreditApplication> getPendingApplications() {
        return creditApplicationRepository.findByStatusOrderBySubmittedDateDesc("PENDING");
    }

    // Get applications with filters - UPDATED TO RETURN DTOS
    public List<CreditApplicationDTO> getApplicationsWithFilters(String status, String type) {
        List<CreditApplication> applications = creditApplicationRepository.findApplicationsWithFilters(status, type);
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Approve application (UPDATED WITH EMAIL)
    @Transactional
    public CreditAccount approveApplication(Long applicationId, String adminUsername) {
        CreditApplication application = getApplication(applicationId);
        
        if (!application.isPending()) {
            throw new RuntimeException("Application is not pending");
        }

        if (!application.isNewAccount()) {
            throw new RuntimeException("This service only handles new account applications");
        }

        // Update application
        application.setStatus("APPROVED");
        application.setReviewedBy(adminUsername);
        application.setReviewedDate(LocalDateTime.now());

        // Create credit account
        CreditAccount creditAccount = createCreditAccount(application);
        
        // Link account to application
        application.setCreditAccount(creditAccount);
        
        // Save both
        creditApplicationRepository.save(application);
        
        // ==================== SEND APPROVAL EMAIL ====================
        try {
            User user = application.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String accountNumber = creditAccount.getAccountNumber();
            String lastFour = accountNumber.substring(accountNumber.length() - 4);
            Double creditLimit = creditAccount.getCreditLimit();
            Double availableCredit = creditAccount.getAvailableCredit();
            
            // Get card details
            List<CreditCard> cards = creditAccount.getCards();
            String physicalCardLastFour = "";
            String virtualCardLastFour = "";
            
            for (CreditCard card : cards) {
                if ("PHYSICAL".equals(card.getCardType())) {
                    physicalCardLastFour = card.getCardNumber().substring(card.getCardNumber().length() - 4);
                } else if ("VIRTUAL".equals(card.getCardType())) {
                    virtualCardLastFour = card.getCardNumber().substring(card.getCardNumber().length() - 4);
                }
            }
            
            String subject = "✅ Your SnopitechBank Credit Card Has Been Approved!";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }" +
                ".content { padding: 30px; }" +
                ".account-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                ".card-info { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border: 1px solid #e0e0e0; }" +
                ".card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }" +
                ".card-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }" +
                ".card-box p { margin: 5px 0; }" +
                ".card-box .card-number { font-size: 18px; font-family: monospace; letter-spacing: 2px; }" +
                ".footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; }" +
                ".button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Congratulations " + userName + "!</h1>" +
                "<p>Your credit card application has been approved</p>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>Great news! Your credit card application has been reviewed and <strong style='color: #22c55e;'>APPROVED</strong>.</p>" +
                
                "<div class='account-details'>" +
                "<h3 style='margin-top: 0;'>📋 Account Details</h3>" +
                "<p><strong>Account Number:</strong> ****" + lastFour + "</p>" +
                "<p><strong>Credit Limit:</strong> $" + String.format("%,.2f", creditLimit) + "</p>" +
                "<p><strong>Available Credit:</strong> $" + String.format("%,.2f", availableCredit) + "</p>" +
                "<p><strong>Interest Rate:</strong> " + String.format("%.2f", creditAccount.getInterestRate()) + "% APR</p>" +
                "<p><strong>Payment Due Date:</strong> " + creditAccount.getPaymentDueDay() + "th of each month</p>" +
                "<p><strong>Minimum Payment:</strong> $" + String.format("%,.2f", creditAccount.getMinimumPaymentAmount()) + " or " + 
                    String.format("%.1f", creditAccount.getMinimumPaymentPercentage()) + "% of balance</p>" +
                "</div>" +
                
                "<h3>💳 Your Credit Cards</h3>" +
                "<div class='card-grid'>";
            
            if (!physicalCardLastFour.isEmpty()) {
                htmlContent += "<div class='card-box'>" +
                    "<h4 style='margin-top: 0;'>💳 Physical Card</h4>" +
                    "<p class='card-number'>****-****-****-" + physicalCardLastFour + "</p>" +
                    "<p>Status: <strong>Inactive</strong></p>" +
                    "<p style='font-size: 12px;'>Activate your card to start using it</p>" +
                    "</div>";
            }
            
            if (!virtualCardLastFour.isEmpty()) {
                htmlContent += "<div class='card-box'>" +
                    "<h4 style='margin-top: 0;'>📱 Virtual Card</h4>" +
                    "<p class='card-number'>****-****-****-" + virtualCardLastFour + "</p>" +
                    "<p>Status: <strong>Inactive</strong></p>" +
                    "<p style='font-size: 12px;'>Use immediately for online purchases</p>" +
                    "</div>";
            }
            
            htmlContent += "</div>" +
                
                "<h3>✅ What You Can Do Now:</h3>" +
                "<ul>" +
                "<li>✓ Activate your physical card in the app or online banking</li>" +
                "<li>✓ Your virtual card is ready for online purchases</li>" +
                "<li>✓ Set up autopay to never miss a payment</li>" +
                "<li>✓ Add your card to digital wallets (Apple Pay, Google Pay)</li>" +
                "<li>✓ Track your spending and rewards in the dashboard</li>" +
                "</ul>" +
                
                "<div style='text-align: center;'>" +
                "<a href='http://localhost:5173/dashboard' class='button'>Go to Your Dashboard</a>" +
                "</div>" +
                
                "<p style='margin-top: 30px;'>If you have any questions or need assistance, please contact us:</p>" +
                "<p>📞 +1 (713) 870-1132<br>📧 snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "<p style='font-size: 12px;'>This is an automated message, please do not reply to this email.</p>" +
                "</div>" +
                "</div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            
            System.out.println("✅ Credit card approval email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the approval
            System.err.println("⚠️ Failed to send credit card approval email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return creditAccount;
    }

    // Reject application
    @Transactional
    public CreditApplication rejectApplication(Long applicationId, String adminUsername, String rejectionReason) {
        CreditApplication application = getApplication(applicationId);
        
        if (!application.isPending()) {
            throw new RuntimeException("Application is not pending");
        }
application.setStatus("REJECTED");
application.setReviewedBy(adminUsername);
application.setReviewedDate(LocalDateTime.now());
application.setRejectionReason(rejectionReason);

CreditApplication rejectedApplication = creditApplicationRepository.save(application);

// ==================== SEND REJECTION EMAIL ====================
try {
    User user = application.getUser();
    String userEmail = user.getEmail();
    String userName = user.getFirstName() + " " + user.getLastName();
    
    String subject = "Update on Your SnopitechBank Credit Card Application";
    String message = String.format(
        "Dear %s,\n\n" +
        "Thank you for your interest in a SnopitechBank credit card.\n\n" +
        "After careful review of your application, we regret to inform you that we are unable to approve your credit card at this time.\n\n" +
        "Reason: %s\n\n" +
        "If you have any questions or would like to provide additional information, " +
        "please contact our support team:\n" +
        "📞 +1 (713) 870-1132\n" +
        "📧 snopitech@gmail.com\n\n" +
        "Best regards,\n" +
        "SnopitechBank Credit Team",
        userName, rejectionReason
    );
    
    emailService.sendSimpleEmail(userEmail, subject, message);
    System.out.println("✅ Credit application rejection email sent to: " + userEmail);
    
} catch (Exception e) {
    System.err.println("⚠️ Failed to send rejection email: " + e.getMessage());
}
// ==================== END EMAIL ====================

return rejectedApplication;

    }

    // Create credit account and cards for approved application
    private CreditAccount createCreditAccount(CreditApplication application) {
        User user = application.getUser();
        
        // Create credit account
        CreditAccount creditAccount = new CreditAccount(user, application.getRequestedLimit());
        creditAccount.setAccountNumber(generateAccountNumber());
        creditAccount.setInterestRate(18.99); // 18.99% APR
        creditAccount.setPaymentDueDay(15); // Payment due on 15th of each month
        creditAccount.setMinimumPaymentPercentage(2.0); // 2% of balance
        creditAccount.setMinimumPaymentAmount(25.0); // $25 minimum
        creditAccount.setIncreaseCount(1); // First account (5k)
        
        // Save account first
        creditAccount = creditAccountRepository.save(creditAccount);
        
        // Create physical card
        CreditCard physicalCard = createCreditCard(creditAccount, user, "PHYSICAL");
        
        // Create virtual card
        CreditCard virtualCard = createCreditCard(creditAccount, user, "VIRTUAL");
        
        // Add cards to account
        creditAccount.addCard(physicalCard);
        creditAccount.addCard(virtualCard);
        
        // Save cards
        creditCardRepository.save(physicalCard);
        creditCardRepository.save(virtualCard);
        
        // Update account with cards
        return creditAccountRepository.save(creditAccount);
    }

    // Create individual credit card
    private CreditCard createCreditCard(CreditAccount account, User user, String cardType) {
        CreditCard card = new CreditCard(account, user.getFullName(), cardType);
        
        // Generate card details
        card.setCardNumber(generateCardNumber());
        card.setExpiryDate(generateExpiryDate());
        card.setCvv(generateCVV());
        card.setPinHash("$2a$10$temp.temp.temp.temp.temp"); // Temporary PIN, user will set on activation
        card.setStatus("INACTIVE"); // Needs activation
        card.setCreditLimit(account.getCreditLimit());
        card.setAvailableCredit(account.getCreditLimit());
        card.setCurrentBalance(0.0);
        card.setForeignTransactionFee(3.0); // 3% foreign transaction fee
        card.setCashAdvanceLimit(account.getCreditLimit() * 0.5); // 50% of limit
        card.setCashAdvanceAvailable(account.getCreditLimit() * 0.5);
        card.setCashAdvanceFee(5.0); // 5% or $10 min
        card.setRewardType("POINTS");
        card.setRewardPoints(0);
        
        // Set design based on card type
        if ("VIRTUAL".equals(cardType)) {
            card.setDesignColor("DIGITAL_BLUE");
        } else {
            card.setDesignColor("CLASSIC_BLACK");
        }
        
        return card;
    }

    // Generate unique account number
    private String generateAccountNumber() {
        String accountNumber;
        do {
            // Format: 16 digits, grouped as 4-4-4-4
            accountNumber = String.format("%04d-%04d-%04d-%04d",
                    new Random().nextInt(10000),
                    new Random().nextInt(10000),
                    new Random().nextInt(10000),
                    new Random().nextInt(10000));
        } while (creditAccountRepository.findByAccountNumber(accountNumber).isPresent());
        
        return accountNumber;
    }

    // Generate card number
    private String generateCardNumber() {
        // Simple card number generation - in production, use proper BIN ranges and Luhn algorithm
        return String.format("%04d-%04d-%04d-%04d",
                new Random().nextInt(10000),
                new Random().nextInt(10000),
                new Random().nextInt(10000),
                new Random().nextInt(10000));
    }

    // Generate expiry date (3 years from now)
    private LocalDate generateExpiryDate() {
        return LocalDate.now().plusYears(3);
    }

    // Generate CVV
    private String generateCVV() {
        return String.format("%03d", new Random().nextInt(1000));
    }

    // Check if user is eligible for new account
    public boolean isEligibleForNewAccount(Long userId) {
        // Check for existing pending application
        if (creditApplicationRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            return false;
        }
        
        // Check for existing active account
        if (creditAccountRepository.existsByUserIdAndStatus(userId, "ACTIVE")) {
            return false;
        }
        
        // Additional eligibility checks could go here
        // - Minimum age
        // - Credit score requirements
        // - Income requirements
        // - etc.
        
        return true;
    }

    // Get application statistics for admin
    public ApplicationStatistics getApplicationStatistics() {
        ApplicationStatistics stats = new ApplicationStatistics();
        
        stats.setTotalApplications(creditApplicationRepository.count());
        stats.setPendingApplications(creditApplicationRepository.countPendingApplications());
        stats.setApprovedApplications(creditApplicationRepository.findByStatus("APPROVED").size());
        stats.setRejectedApplications(creditApplicationRepository.findByStatus("REJECTED").size());
        
        return stats;
    }

    // ==================== NEW HELPER METHOD TO CONVERT TO DTO ====================
    
    /**
     * Convert CreditApplication entity to CreditApplicationDTO
     */
    private CreditApplicationDTO convertToDTO(CreditApplication app) {
        User user = app.getUser();
        CreditAccount account = app.getCreditAccount();
        
        return new CreditApplicationDTO(
            app.getId(),
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            app.getApplicationType(),
            app.getRequestedLimit(),
            app.getReason(),
            app.getCreditPurpose(),
            app.getMonthlyHousingPayment(),
            app.getYearsAtCurrentAddress(),
            app.getPreviousAddress(),
            app.getCitizenshipStatus(),
            app.getAgreeToTerms(),
            app.getStatus(),
            app.getSubmittedDate(),
            app.getReviewedDate(),
            app.getReviewedBy(),
            app.getRejectionReason(),
            account != null ? account.getId() : null,
            account != null ? account.getMaskedAccountNumber() : null
        );
    }

    // Inner class for statistics
    public static class ApplicationStatistics {
        private long totalApplications;
        private long pendingApplications;
        private long approvedApplications;
        private long rejectedApplications;

        // Getters and setters
        public long getTotalApplications() { return totalApplications; }
        public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
        
        public long getPendingApplications() { return pendingApplications; }
        public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }
        
        public long getApprovedApplications() { return approvedApplications; }
        public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }
        
        public long getRejectedApplications() { return rejectedApplications; }
        public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
    }
}
package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.LoanApplication;
import com.snopitech.snopitechbank.model.LoanAccount;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.LoanApplicationRepository;
import com.snopitech.snopitechbank.repository.LoanAccountRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
@Service
public class LoanApplicationService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private LoanAccountRepository loanAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Constants
    private static final Double MIN_LOAN_AMOUNT = 100.0;
    private static final Double MAX_LOAN_AMOUNT = 1_000_000_000.0;
    private static final int MAX_LOAN_COUNT = 3;

    // ==================== SUBMIT LOAN APPLICATION ====================

    @Transactional
    public LoanApplication submitApplication(
            Long userId,
            Double requestedAmount,
            String loanPurpose,
            String reason,
            Integer requestedTermMonths,
            String employmentStatus,
            Double annualIncome,
            String employerName,
            Integer yearsAtEmployer) {
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate loan amount
        if (requestedAmount < MIN_LOAN_AMOUNT || requestedAmount > MAX_LOAN_AMOUNT) {
            throw new RuntimeException("Loan amount must be between $" + MIN_LOAN_AMOUNT + 
                                     " and $" + MAX_LOAN_AMOUNT);
        }

        // Check existing loan count (max 3)
        int existingLoanCount = loanAccountRepository.countActiveLoansByUserId(userId);
        if (existingLoanCount >= MAX_LOAN_COUNT) {
            throw new RuntimeException("You have reached your maximum limit of " + MAX_LOAN_COUNT + 
                                     " loans. Please contact a banker for assistance.");
        }

        // Check if user already has a pending application
        if (loanApplicationRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            throw new RuntimeException("You already have a pending loan application");
        }

        // Create application
        LoanApplication application = new LoanApplication(user, requestedAmount, loanPurpose, requestedTermMonths);
        application.setReason(reason);
        application.setEmploymentStatus(employmentStatus);
        application.setAnnualIncome(annualIncome);
        application.setEmployerName(employerName);
        application.setYearsAtEmployer(yearsAtEmployer);
        application.setExistingLoanCount(existingLoanCount); // Store current count

        LoanApplication savedApplication = loanApplicationRepository.save(application);

        // ==================== SEND UNDER REVIEW EMAIL ====================
        try {
            String subject = "Your Snopitech Bank Loan Application";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for applying for a loan with Snopitech Bank.\n\n" +
                "Loan Details:\n" +
                "• Amount: $%,.2f\n" +
                "• Purpose: %s\n" +
                "• Term: %d months\n\n" +
                "Your application has been submitted and is currently under review by our team. " +
                "You will receive another email once a decision has been made.\n\n" +
                "If you have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Lending Team",
                user.getFirstName(), user.getLastName(), 
                requestedAmount, loanPurpose.replace("_", " "), requestedTermMonths
            );
            emailService.sendSimpleEmail(user.getEmail(), subject, message);
            System.out.println("✅ Loan application under review email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send under review email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return savedApplication;
    }

    // ==================== GET APPLICATIONS ====================

    public LoanApplication getApplication(Long id) {
        return loanApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan application not found with id: " + id));
    }

    public List<LoanApplication> getUserApplications(Long userId) {
        return loanApplicationRepository.findByUserId(userId);
    }

    public List<LoanApplication> getAllPending() {
        return loanApplicationRepository.findAllPending();
    }

    public List<LoanApplication> getAllApproved() {
        return loanApplicationRepository.findAllApproved();
    }

    public List<LoanApplication> getAllRejected() {
        return loanApplicationRepository.findAllRejected();
    }

    public List<LoanApplication> searchApplications(String searchTerm) {
        return loanApplicationRepository.searchByUserInfo(searchTerm);
    }

    // ==================== APPROVE APPLICATION ====================

    @Transactional
    public LoanApplication approveApplication(Long applicationId, String adminUsername) {
        LoanApplication application = getApplication(applicationId);

        if (!application.isPending()) {
            throw new RuntimeException("Application is not pending");
        }

        // Update application status
        application.approve(adminUsername);
        LoanApplication approved = loanApplicationRepository.save(application);

        // ==================== CREATE LOAN ACCOUNT ====================
        try {
            User user = application.getUser();
            
            // Calculate interest rate based on amount and term
            double interestRate = calculateInterestRate(application.getRequestedAmount(), 
                                                        application.getRequestedTermMonths());
            
            // Create new loan account
            LoanAccount loanAccount = new LoanAccount(
                user,
                application,
                application.getRequestedAmount(),
                interestRate,
                application.getRequestedTermMonths()
            );
            
            // Save loan account
            loanAccountRepository.save(loanAccount);
            
            System.out.println("✅ Loan account created for user: " + user.getEmail());
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to create loan account: " + e.getMessage());
            // Don't fail the approval if account creation fails
        }
        // ==================== END LOAN ACCOUNT CREATION ====================

        // ==================== SEND APPROVAL EMAIL ====================
        try {
            User user = application.getUser();
            String subject = "Your Snopitech Bank Loan Has Been Approved!";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Congratulations! Your loan application has been approved.\n\n" +
                "Loan Details:\n" +
                "• Amount: $%,.2f\n" +
                "• Purpose: %s\n" +
                "• Term: %d months\n" +
                "• Interest Rate: %.2f%% APR\n" +
                "• Monthly Payment: $%,.2f\n\n" +
                "The funds will be deposited to your account within 1-2 business days.\n\n" +
                "You can view your loan details in the Accounts section of your dashboard.\n\n" +
                "If you have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Lending Team",
                user.getFirstName(), user.getLastName(),
                application.getRequestedAmount(),
                application.getLoanPurpose().replace("_", " "),
                application.getRequestedTermMonths(),
                calculateInterestRate(application.getRequestedAmount(), application.getRequestedTermMonths()),
                calculateMonthlyPayment(application.getRequestedAmount(), 
                    calculateInterestRate(application.getRequestedAmount(), application.getRequestedTermMonths()),
                    application.getRequestedTermMonths())
            );
            emailService.sendSimpleEmail(user.getEmail(), subject, message);
            System.out.println("✅ Loan approval email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send approval email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return approved;
    }

    // ==================== REJECT APPLICATION ====================

    @Transactional
    public LoanApplication rejectApplication(Long applicationId, String adminUsername, String reason) {
        LoanApplication application = getApplication(applicationId);

        if (!application.isPending()) {
            throw new RuntimeException("Application is not pending");
        }

        application.reject(adminUsername, reason);
        LoanApplication rejected = loanApplicationRepository.save(application);

        // ==================== SEND REJECTION EMAIL ====================
        try {
            User user = application.getUser();
            String subject = "Update on Your Snopitech Bank Loan Application";
            String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for your interest in a loan with Snopitech Bank.\n\n" +
                "After careful review, we regret to inform you that we are unable to approve your loan application at this time.\n\n" +
                "Reason: %s\n\n" +
                "If you have any questions or would like to provide additional information, " +
                "please contact our support team.\n\n" +
                "Best regards,\n" +
                "Snopitech Bank Lending Team",
                user.getFirstName(), user.getLastName(), reason
            );
            emailService.sendSimpleEmail(user.getEmail(), subject, message);
            System.out.println("✅ Loan rejection email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send rejection email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================

        return rejected;
    }

    // ==================== CHECK ELIGIBILITY ====================

    public boolean canApplyForLoan(Long userId) {
        int existingLoanCount = loanAccountRepository.countActiveLoansByUserId(userId);
        return existingLoanCount < MAX_LOAN_COUNT;
    }

    public int getRemainingLoanSlots(Long userId) {
        int existingLoanCount = loanAccountRepository.countActiveLoansByUserId(userId);
        return MAX_LOAN_COUNT - existingLoanCount;
    }

    // ==================== STATISTICS ====================

    public LoanStatistics getStatistics() {
        LoanStatistics stats = new LoanStatistics();
        stats.setTotalApplications(loanApplicationRepository.getTotalApplications());
        stats.setPendingApplications(loanApplicationRepository.getPendingCount());
        stats.setApprovedApplications(loanApplicationRepository.getApprovedCount());
        stats.setRejectedApplications(loanApplicationRepository.getRejectedCount());
        stats.setTotalApprovedAmount(loanApplicationRepository.getTotalApprovedAmount());
        return stats;
    }

    // ==================== HELPER METHODS ====================

    private double calculateInterestRate(Double amount, Integer termMonths) {
        // Base rate
        double baseRate = 5.0; // 5% base
        
        // Adjust based on loan amount
        if (amount > 500000) {
            baseRate -= 0.5; // Better rate for large loans
        } else if (amount < 10000) {
            baseRate += 1.0; // Higher rate for small loans
        }
        
        // Adjust based on term
        if (termMonths > 60) {
            baseRate += 1.0; // Higher rate for longer terms
        } else if (termMonths < 24) {
            baseRate -= 0.5; // Better rate for short terms
        }
        
        // Ensure rate is within reasonable range
        return Math.min(Math.max(baseRate, 3.5), 18.0);
    }

    private double calculateMonthlyPayment(Double amount, Double annualRate, Integer termMonths) {
        double monthlyRate = annualRate / 100 / 12;
        if (monthlyRate == 0) return amount / termMonths;
        
        double factor = Math.pow(1 + monthlyRate, termMonths);
        return amount * (monthlyRate * factor) / (factor - 1);
    }

    // ==================== ADMIN OVERRIDE ====================

    @Transactional
    public void increaseMaxLoanLimit(Long userId, int additionalSlots) {
        // This would be called by admin to extend limits
        // Implementation depends on how you want to store this
        System.out.println("Admin extended loan limit for user " + userId + " by " + additionalSlots + " slots");
    }

    // Inner class for statistics
    public static class LoanStatistics {
        private long totalApplications;
        private long pendingApplications;
        private long approvedApplications;
        private long rejectedApplications;
        private double totalApprovedAmount;

        public long getTotalApplications() { return totalApplications; }
        public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
        public long getPendingApplications() { return pendingApplications; }
        public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }
        public long getApprovedApplications() { return approvedApplications; }
        public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }
        public long getRejectedApplications() { return rejectedApplications; }
        public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
        public double getTotalApprovedAmount() { return totalApprovedAmount; }
        public void setTotalApprovedAmount(double totalApprovedAmount) { this.totalApprovedAmount = totalApprovedAmount; }
    }
}
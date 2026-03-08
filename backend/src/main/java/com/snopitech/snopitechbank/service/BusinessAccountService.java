package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.BusinessAccountDTO;
import com.snopitech.snopitechbank.dto.OpenBusinessAccountRequest;
import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BusinessAccountService {

    @Autowired
    private BusinessAccountRepository businessAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardService cardService;

    @Autowired
    private CardRepository cardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private EmailService emailService;

    private static final String BUSINESS_CHECKING_PREFIX = "46579";
    private static final String ROUTING_NUMBER = "842917356";
    private final Random random = new Random();

    // ==================== SUBMIT BUSINESS ACCOUNT APPLICATION ====================

    /**
     * Submit a new business account application
     * POST /api/business/accounts/open
     */
    @Transactional
    public BusinessAccountDTO submitApplication(OpenBusinessAccountRequest request) {
        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Check if EIN already exists
        if (businessAccountRepository.findByEin(request.getFormattedEin()).isPresent()) {
            throw new RuntimeException("Business with this EIN already has an account");
        }

        // Create business application record (NO account or cards yet)
        BusinessAccount application = new BusinessAccount(
            user,
            request.getBusinessName(),
            request.getFormattedEin(),
            request.getBusinessType(),
            request.getIndustry(),
            request.getBusinessAddress()
        );

        // Set additional fields
        application.setBusinessAddress2(request.getBusinessAddress2());
        application.setBusinessCity(request.getBusinessCity());
        application.setBusinessState(request.getBusinessState());
        application.setBusinessZipCode(request.getBusinessZipCode());
        application.setBusinessCountry(request.getBusinessCountry());
        application.setBusinessPhone(request.getBusinessPhone());
        application.setBusinessEmail(request.getBusinessEmail());
        application.setWebsite(request.getWebsite());
        application.setYearsInOperation(request.getYearsInOperation());
        application.setAnnualRevenue(request.getAnnualRevenue());
        application.setNumberOfEmployees(request.getNumberOfEmployees());
        application.setLegalStructure(request.getLegalStructure());
        application.setAuthorizedSigners(request.getAuthorizedSigners());
        application.setEstimatedMonthlyVolume(request.getEstimatedMonthlyVolume());
        application.setEstimatedMonthlyTransactions(request.getEstimatedMonthlyTransactions());
        
        // Set application specific fields
        application.setStatus("PENDING");
        application.setApplicationStatus("PENDING_REVIEW");
        application.setVerified(false);
        application.setSubmittedDate(LocalDateTime.now());

        BusinessAccount savedApplication = businessAccountRepository.save(application);

// ==================== SEND UNDER REVIEW EMAIL ====================
try {
    String userEmail = user.getEmail();
    String userName = user.getFirstName() + " " + user.getLastName();
    String businessName = request.getBusinessName();
    
    String subject = "Your SnopitechBank Business Account Application";
    String message = String.format(
        "Dear %s,\n\n" +
        "Thank you for applying for a SnopitechBank business account for %s.\n\n" +
        "Your application has been submitted and is currently under review by our business banking team. " +
        "You will receive another email once a decision has been made.\n\n" +
        "If you have any questions, please contact our business banking team:\n" +
        "📞 +1 (713) 870-1132\n" +
        "📧 snopitech@gmail.com\n\n" +
        "Best regards,\n" +
        "SnopitechBank Business Team",
        userName, businessName
    );
    
    emailService.sendSimpleEmail(userEmail, subject, message);
    System.out.println("✅ Business application under review email sent to: " + userEmail);
    
} catch (Exception e) {
    System.err.println("⚠️ Failed to send under review email: " + e.getMessage());
}
// ==================== END EMAIL ====================

return convertToDTO(savedApplication);

    }

    // ==================== APPROVE BUSINESS ACCOUNT APPLICATION ====================

    /**
     * Approve a business account application and create the actual account
     * POST /api/admin/business/applications/{id}/approve
     */
    @Transactional
    public BusinessAccountDTO approveApplication(Long applicationId, String approvedBy) {
        BusinessAccount application = businessAccountRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        // Check if already approved
        if ("APPROVED".equals(application.getStatus())) {
            throw new RuntimeException("Application already approved");
        }

        // Create the actual bank account
        Account businessAccount = createBusinessAccount(application.getUser(), application);
        
        // Link the account to the application
        application.setAccount(businessAccount);
        
        // Create business debit cards if requested (you may want to store this in application)
        boolean requestDebitCard = true; // You might want to add this to the application entity
        if (requestDebitCard) {
            List<Card> businessCards = new ArrayList<>();
            
            // Create physical card (PRIMARY)
            Card physicalCard = cardService.generateCardForAccount(businessAccount, "PHYSICAL");
            physicalCard.setBusinessAccount(application);
            physicalCard.setCardPurpose("PRIMARY");
            businessCards.add(physicalCard);
            
            // Create virtual card automatically with business accounts
            Card virtualCard = cardService.generateCardForAccount(businessAccount, "VIRTUAL");
            virtualCard.setBusinessAccount(application);
            virtualCard.setCardPurpose("VIRTUAL");
            virtualCard.setDailyLimit(500.0);
            virtualCard.setTransactionLimit(250.0);
            businessCards.add(virtualCard);
            
            // Save both cards
            cardRepository.saveAll(businessCards);
            
            // Set primary card ID to the physical card
            application.setPrimaryCardId(physicalCard.getId());
            application.setCards(businessCards);
        }

        // Update application status
        application.setStatus("APPROVED");
        application.setVerified(true);
        application.setVerifiedDate(LocalDateTime.now());
        application.setVerifiedBy(approvedBy);
        application.setReviewedDate(LocalDateTime.now());
        application.setReviewedBy(approvedBy);
        application.setApplicationStatus("APPROVED");

        BusinessAccount approved = businessAccountRepository.save(application);
        
        // ==================== SEND APPROVAL EMAIL ====================
        try {
            User user = application.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String businessName = application.getBusinessName();
            String accountNumber = businessAccount.getAccountNumber();
            String lastFour = accountNumber.substring(accountNumber.length() - 4);
            
            String subject = "Your SnopitechBank Business Account Has Been Approved!";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".account-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Congratulations " + userName + "!</h1><p>Your business account has been approved</p></div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>Great news! Your business account application for <strong>" + businessName + "</strong> has been reviewed and <strong style='color: #22c55e;'>APPROVED</strong>.</p>" +
                "<div class='account-details'>" +
                "<h3 style='margin-top: 0;'>📋 Account Details</h3>" +
                "<p><strong>Business Name:</strong> " + businessName + "</p>" +
                "<p><strong>Account Number:</strong> ****" + lastFour + "</p>" +
                "<p><strong>Routing Number:</strong> " + ROUTING_NUMBER + "</p>" +
                "<p><strong>Account Type:</strong> Business Checking</p>" +
                "</div>" +
                "<h3>💳 Your Business Cards</h3>" +
                "<p>Your business debit cards have been issued and are ready to use:</p>" +
                "<ul><li><strong>Physical Card</strong> - For in-person purchases and ATM withdrawals</li>" +
                "<li><strong>Virtual Card</strong> - For online purchases and digital wallets</li></ul>" +
                "<p>If you have any questions, please contact our business banking team:</p>" +
                "<p>📞 +1 (713) 870-1132<br>📧 snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            
            System.out.println("✅ Business account approval email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the approval
            System.err.println("⚠️ Failed to send approval email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return convertToDTO(approved);
    }

    /**
     * Create the main business checking account (helper method)
     */
    private Account createBusinessAccount(User user, BusinessAccount application) {
        Account account = new Account();
        account.setUser(user);
        account.setOwnerName(application.getBusinessName());
        account.setAccountType("BUSINESS_CHECKING");
        account.setBalance(0.0);
        account.setRoutingNumber(ROUTING_NUMBER);
        account.setAccountNumber(generateBusinessAccountNumber());
        account.setNickname(application.getBusinessName() + " Business Account");
        
        return accountRepository.save(account);
    }

    /**
     * Generate unique business account number
     */
    private String generateBusinessAccountNumber() {
        int suffix = 10000 + random.nextInt(90000);
        return BUSINESS_CHECKING_PREFIX + suffix;
    }

    // ==================== REJECT BUSINESS ACCOUNT APPLICATION ====================

    /**
     * Reject a business account application
     * POST /api/admin/business/applications/{id}/reject
     */
    @Transactional
    public BusinessAccountDTO rejectApplication(Long applicationId, String reason, String rejectedBy) {
        BusinessAccount application = businessAccountRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        // Check if already processed
        if (!"PENDING".equals(application.getStatus())) {
            throw new RuntimeException("Application already " + application.getStatus());
        }

        application.setStatus("REJECTED");
        application.setRejectionReason(reason);
        application.setReviewedDate(LocalDateTime.now());
        application.setReviewedBy(rejectedBy);
        application.setApplicationStatus("REJECTED");

       BusinessAccount rejected = businessAccountRepository.save(application);

// ==================== SEND REJECTION EMAIL ====================
try {
    User user = application.getUser();
    String userEmail = user.getEmail();
    String userName = user.getFirstName() + " " + user.getLastName();
    String businessName = application.getBusinessName();
    
    String subject = "Update on Your SnopitechBank Business Account Application";
    String message = String.format(
        "Dear %s,\n\n" +
        "Thank you for your interest in SnopitechBank business banking.\n\n" +
        "After careful review of your application for %s, we regret to inform you that we are unable to approve your business account at this time.\n\n" +
        "Reason: %s\n\n" +
        "If you have any questions or would like to provide additional information, " +
        "please contact our business banking team:\n" +
        "📞 +1 (713) 870-1132\n" +
        "📧 snopitech@gmail.com\n\n" +
        "Best regards,\n" +
        "SnopitechBank Business Team",
        userName, businessName, reason
    );
    
    emailService.sendSimpleEmail(userEmail, subject, message);
    System.out.println("✅ Business application rejection email sent to: " + userEmail);
    
} catch (Exception e) {
    System.err.println("⚠️ Failed to send rejection email: " + e.getMessage());
}
// ==================== END EMAIL ====================

return convertToDTO(rejected);
    }

    // ==================== GET BUSINESS ACCOUNTS / APPLICATIONS ====================

    /**
     * Get business account by ID
     * GET /api/business/accounts/{accountId}
     */
    public BusinessAccountDTO getBusinessAccountById(Long accountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));
        return convertToDTO(businessAccount);
    }

   /**
 * Get all business accounts for a user (including applications)
 * GET /api/business/accounts/user/{userId}
 */
public List<BusinessAccountDTO> getBusinessAccountsByUser(Long userId) {
    List<BusinessAccount> businessAccounts = businessAccountRepository.findByUserId(userId);
    
    // Filter out rejected applications so they don't appear in the dashboard
    List<BusinessAccountDTO> filteredAccounts = businessAccounts.stream()
            .filter(account -> !"REJECTED".equals(account.getStatus()))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    
    return filteredAccounts;
}

    /**
     * Get business account by account ID (linked main account)
     */
    public BusinessAccountDTO getBusinessAccountByAccountId(Long accountId) {
        BusinessAccount businessAccount = businessAccountRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found for account id: " + accountId));
        return convertToDTO(businessAccount);
    }

    // ==================== CARD MANAGEMENT ====================

    /**
     * Generate an additional virtual card for an existing business account
     */
    @Transactional
    public Card generateAdditionalVirtualCard(Long businessAccountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(businessAccountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + businessAccountId));
        
        if (businessAccount.getAccount() == null) {
            throw new RuntimeException("Account not yet approved");
        }
        
        Account mainAccount = businessAccount.getAccount();
        
        // Create new virtual card
        Card virtualCard = cardService.generateCardForAccount(mainAccount, "VIRTUAL");
        virtualCard.setBusinessAccount(businessAccount);
        virtualCard.setCardPurpose("ADDITIONAL_VIRTUAL");
        virtualCard.setDailyLimit(500.0);
        virtualCard.setTransactionLimit(250.0);
        
        Card savedCard = cardRepository.save(virtualCard);
        
        // Add to business account's cards list
        List<Card> currentCards = businessAccount.getCards();
        if (currentCards == null) {
            currentCards = new ArrayList<>();
        }
        currentCards.add(savedCard);
        businessAccount.setCards(currentCards);
        businessAccountRepository.save(businessAccount);
        
        return savedCard;
    }

    /**
     * Get all cards for a business account
     */
    public List<Card> getBusinessAccountCards(Long businessAccountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(businessAccountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + businessAccountId));
        
        return businessAccount.getCards();
    }

    /**
     * Get primary card for a business account
     */
    public Card getPrimaryCard(Long businessAccountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(businessAccountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + businessAccountId));
        
        return businessAccount.getPrimaryCard();
    }

    /**
     * Set a different card as primary
     */
    @Transactional
    public void setPrimaryCard(Long businessAccountId, Long cardId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(businessAccountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + businessAccountId));
        
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
        
        // Verify card belongs to this business account
        if (!card.getBusinessAccount().getId().equals(businessAccountId)) {
            throw new RuntimeException("Card does not belong to this business account");
        }
        
        businessAccount.setPrimaryCardId(cardId);
        businessAccountRepository.save(businessAccount);
    }

    // ==================== UPDATE BUSINESS ACCOUNT ====================

    /**
     * Update business account information
     * PUT /api/business/accounts/{accountId}/update
     */
    @Transactional
    public BusinessAccountDTO updateBusinessAccount(Long accountId, OpenBusinessAccountRequest request) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));

        // Only allow updates if not approved yet
        if ("APPROVED".equals(businessAccount.getStatus())) {
            throw new RuntimeException("Cannot update approved application");
        }

        // Update fields (only allowed fields can be updated)
        if (request.getBusinessPhone() != null) {
            businessAccount.setBusinessPhone(request.getBusinessPhone());
        }
        if (request.getBusinessEmail() != null) {
            businessAccount.setBusinessEmail(request.getBusinessEmail());
        }
        if (request.getWebsite() != null) {
            businessAccount.setWebsite(request.getWebsite());
        }
        if (request.getBusinessAddress() != null) {
            businessAccount.setBusinessAddress(request.getBusinessAddress());
        }
        if (request.getBusinessAddress2() != null) {
            businessAccount.setBusinessAddress2(request.getBusinessAddress2());
        }
        if (request.getBusinessCity() != null) {
            businessAccount.setBusinessCity(request.getBusinessCity());
        }
        if (request.getBusinessState() != null) {
            businessAccount.setBusinessState(request.getBusinessState());
        }
        if (request.getBusinessZipCode() != null) {
            businessAccount.setBusinessZipCode(request.getBusinessZipCode());
        }
        if (request.getBusinessCountry() != null) {
            businessAccount.setBusinessCountry(request.getBusinessCountry());
        }
        if (request.getEstimatedMonthlyVolume() != null) {
            businessAccount.setEstimatedMonthlyVolume(request.getEstimatedMonthlyVolume());
        }
        if (request.getEstimatedMonthlyTransactions() != null) {
            businessAccount.setEstimatedMonthlyTransactions(request.getEstimatedMonthlyTransactions());
        }
        if (request.getAuthorizedSigners() != null) {
            businessAccount.setAuthorizedSigners(request.getAuthorizedSigners());
        }

        businessAccount.setUpdatedDate(LocalDateTime.now());

        BusinessAccount updatedBusiness = businessAccountRepository.save(businessAccount);
        return convertToDTO(updatedBusiness);
    }

    // ==================== CLOSE BUSINESS ACCOUNT ====================

    /**
     * Close a business account
     */
    @Transactional
    public BusinessAccountDTO closeBusinessAccount(Long accountId, String reason) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));

        // Check if account exists
        if (businessAccount.getAccount() == null) {
            throw new RuntimeException("Account not found");
        }

        businessAccount.setStatus("CLOSED");
        businessAccount.setClosedDate(LocalDateTime.now());
        businessAccount.setClosureReason(reason);

        // Also close the linked main account if it exists
        if (businessAccount.getAccount() != null) {
            Account mainAccount = businessAccount.getAccount();
            mainAccount.setClosed(true);
            mainAccount.setClosedDate(LocalDateTime.now());
            mainAccount.setClosureReason("Business account closed: " + reason);
            accountRepository.save(mainAccount);
        }

        // Deactivate ALL business cards if they exist
        if (businessAccount.getCards() != null && !businessAccount.getCards().isEmpty()) {
            for (Card card : businessAccount.getCards()) {
                card.setStatus("CANCELLED");
                cardRepository.save(card);
            }
        }

        BusinessAccount closedBusiness = businessAccountRepository.save(businessAccount);
        
        // ==================== SEND CLOSURE EMAIL ====================
        try {
            User user = businessAccount.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String businessName = businessAccount.getBusinessName();
            
            String subject = "Your SnopitechBank Business Account Has Been Closed";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Account Closure Confirmation</h1></div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>This email confirms that your business account for <strong>" + businessName + "</strong> has been closed as requested.</p>" +
                "<p><strong>Closure Reason:</strong> " + reason + "</p>" +
                "<p><strong>Closure Date:</strong> " + LocalDateTime.now().toString() + "</p>" +
                "<p>If you did not request this closure or have any questions, please contact our support team immediately:</p>" +
                "<p>📞 +1 (713) 870-1132<br>✉️ snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            System.out.println("✅ Business account closure email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the closure
            System.err.println("⚠️ Failed to send closure email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return convertToDTO(closedBusiness);
    }

    // ==================== NEW: DISABLE/ENABLE BUSINESS ACCOUNT ====================

    /**
     * Disable a business account (temporary freeze)
     * POST /api/business/accounts/{accountId}/disable
     */
    @Transactional
    public BusinessAccountDTO disableBusinessAccount(Long accountId, String reason) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));

        // Check if already closed
        if (businessAccount.isClosed()) {
            throw new RuntimeException("Cannot disable a closed account");
        }

        // Check if already disabled
        if (businessAccount.isDisabled()) {
            throw new RuntimeException("Account is already disabled");
        }

        businessAccount.setDisabled(true);
        businessAccount.setDisabledDate(LocalDateTime.now());
        businessAccount.setDisableReason(reason);
        businessAccount.setStatus("DISABLED");

        // Also disable the linked main account if it exists
        if (businessAccount.getAccount() != null) {
            Account mainAccount = businessAccount.getAccount();
            mainAccount.setDisabled(true);
            mainAccount.setDisabledDate(LocalDateTime.now());
            accountRepository.save(mainAccount);
        }

        // Disable all cards if they exist
        if (businessAccount.getCards() != null && !businessAccount.getCards().isEmpty()) {
            for (Card card : businessAccount.getCards()) {
                card.setStatus("FROZEN");
                cardRepository.save(card);
            }
        }

        BusinessAccount disabledAccount = businessAccountRepository.save(businessAccount);
        return convertToDTO(disabledAccount);
    }

    /**
     * Enable a previously disabled business account
     * POST /api/business/accounts/{accountId}/enable
     */
    @Transactional
    public BusinessAccountDTO enableBusinessAccount(Long accountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));

        // Check if already closed
        if (businessAccount.isClosed()) {
            throw new RuntimeException("Cannot enable a closed account");
        }

        // Check if not disabled
        if (!businessAccount.isDisabled()) {
            throw new RuntimeException("Account is not disabled");
        }

        businessAccount.setDisabled(false);
        businessAccount.setDisabledDate(null);
        businessAccount.setDisableReason(null);
        businessAccount.setStatus("ACTIVE");

        // Also enable the linked main account if it exists
        if (businessAccount.getAccount() != null) {
            Account mainAccount = businessAccount.getAccount();
            mainAccount.setDisabled(false);
            mainAccount.setDisabledDate(null);
            accountRepository.save(mainAccount);
        }

        // Enable all frozen cards
        if (businessAccount.getCards() != null && !businessAccount.getCards().isEmpty()) {
            for (Card card : businessAccount.getCards()) {
                if ("FROZEN".equals(card.getStatus())) {
                    card.setStatus("ACTIVE");
                    cardRepository.save(card);
                }
            }
        }

        BusinessAccount enabledAccount = businessAccountRepository.save(businessAccount);
        return convertToDTO(enabledAccount);
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Get all business account applications with optional status filter
     * GET /api/admin/business/applications?status=PENDING
     */
    public List<BusinessAccountDTO> getApplications(String status) {
        List<BusinessAccount> applications;
        if (status != null && !status.isEmpty()) {
            applications = businessAccountRepository.findByStatus(status);
        } else {
            applications = businessAccountRepository.findAll();
        }
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get application by ID
     * GET /api/admin/business/applications/{id}
     */
    public BusinessAccountDTO getApplicationById(Long id) {
        BusinessAccount application = businessAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return convertToDTO(application);
    }

    /**
     * Get application statistics
     */
    public Map<String, Long> getApplicationStats() {
        List<BusinessAccount> all = businessAccountRepository.findAll();
        
        long pending = all.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
        long approved = all.stream().filter(a -> "APPROVED".equals(a.getStatus())).count();
        long rejected = all.stream().filter(a -> "REJECTED".equals(a.getStatus())).count();
        long total = all.size();
        
        return Map.of(
            "total", total,
            "pending", pending,
            "approved", approved,
            "rejected", rejected
        );
    }
    
    // ==================== DELETE BUSINESS ACCOUNT (PERMANENT) ====================

    /**
     * Permanently delete a business account and all associated data
     */
    @Transactional
    public void deleteBusinessAccount(Long accountId) {
        BusinessAccount businessAccount = businessAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Business account not found with id: " + accountId));
        
        // Balance check removed - allow deletion regardless of balance
        
        // STEP 1: Handle cards - first remove references from business account
        if (businessAccount.getCards() != null && !businessAccount.getCards().isEmpty()) {
            // Get the list of cards
            List<Card> cards = new ArrayList<>(businessAccount.getCards());
            
            // Clear the cards from the business account to break the relationship
            businessAccount.setCards(null);
            businessAccount.setPrimaryCardId(null);
            businessAccountRepository.save(businessAccount);
            
            // Now delete each card individually (may be safer than deleteAll)
            for (Card card : cards) {
                try {
                    cardRepository.delete(card);
                } catch (Exception e) {
                    System.err.println("⚠️ Could not delete card ID " + card.getId() + ": " + e.getMessage());
                    // Continue with other cards even if one fails
                }
            }
        }
        
        // STEP 2: Delete the linked main account if it exists
        if (businessAccount.getAccount() != null) {
            Long linkedAccountId = businessAccount.getAccount().getId();
            try {
                accountRepository.deleteById(linkedAccountId);
            } catch (Exception e) {
                System.err.println("⚠️ Could not delete linked account ID " + linkedAccountId + ": " + e.getMessage());
                // Continue with business account deletion
            }
        }
        
        // STEP 3: Delete the business account
        try {
            businessAccountRepository.delete(businessAccount);
        } catch (Exception e) {
            System.err.println("⚠️ Could not delete business account ID " + accountId + ": " + e.getMessage());
            throw new RuntimeException("Failed to delete business account: " + e.getMessage());
        }
    }

    // ==================== EIN AVAILABILITY CHECK ====================

    /**
     * Check if an EIN is already registered
     */
    public boolean isEinAvailable(String ein) {
        // Clean the EIN (remove any dashes)
        String cleanEin = ein.replaceAll("[^0-9]", "");
        
        // Format as XX-XXXXXXX for lookup
        String formattedEin = cleanEin;
        if (cleanEin.length() == 9) {
            formattedEin = cleanEin.substring(0, 2) + "-" + cleanEin.substring(2);
        }
        
        // Check if exists in repository
        return businessAccountRepository.findByEin(formattedEin).isEmpty();
    }
    

    // ==================== HELPER METHODS ====================

    /**
     * Convert BusinessAccount entity to DTO
     */
    private BusinessAccountDTO convertToDTO(BusinessAccount business) {
        Account mainAccount = business.getAccount();
        Card primaryCard = business.getPrimaryCard();

        return new BusinessAccountDTO(
            business.getId(),
            business.getUser().getId(),
            mainAccount != null ? mainAccount.getId() : null,
            primaryCard != null ? primaryCard.getId() : null,
            business.getBusinessName(),
            business.getEin(),
            business.getBusinessType(),
            business.getIndustry(),
            business.getYearsInOperation(),
            business.getAnnualRevenue(),
            business.getNumberOfEmployees(),
            business.getBusinessAddress(),
            business.getBusinessAddress2(),
            business.getBusinessCity(),
            business.getBusinessState(),
            business.getBusinessZipCode(),
            business.getBusinessCountry(),
            business.getBusinessPhone(),
            business.getBusinessEmail(),
            business.getWebsite(),
            business.getLegalStructure(),
            business.getCreatedDate(),
            business.getUpdatedDate(),
            business.getStatus(),
            business.getVerified(),
            business.getVerifiedDate(),
            business.getEstimatedMonthlyVolume(),
            business.getEstimatedMonthlyTransactions(),
            mainAccount != null ? mainAccount.getAccountNumber() : null,
            mainAccount != null ? mainAccount.getBalance() : 0.0,
            mainAccount != null ? mainAccount.getAccountType() : "PENDING",
            primaryCard != null ? primaryCard.getMaskedCardNumber() : null,
            primaryCard != null ? primaryCard.getStatus() : null,
            business.isDisabled()
        );
    }
}
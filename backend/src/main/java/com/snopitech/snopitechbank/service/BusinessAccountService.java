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
        return businessAccounts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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

        // Check if account exists and has balance
        if (businessAccount.getAccount() != null && businessAccount.getAccount().getBalance() > 0) {
            throw new RuntimeException("Cannot close account with positive balance. Please transfer funds first.");
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
        return convertToDTO(closedBusiness);
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
        
        // Check balance (safety check)
        if (businessAccount.getAccount() != null && businessAccount.getAccount().getBalance() > 0) {
            throw new RuntimeException("Cannot delete account with positive balance. Please transfer funds first.");
        }
        
        // STEP 1: Delete all cards first if they exist
        if (businessAccount.getCards() != null && !businessAccount.getCards().isEmpty()) {
            cardRepository.deleteAll(businessAccount.getCards());
        }
        
        // STEP 2: Delete the linked main account if it exists
        if (businessAccount.getAccount() != null) {
            Long linkedAccountId = businessAccount.getAccount().getId();
            accountRepository.deleteById(linkedAccountId);
        }
        
        // STEP 3: Delete the business account
        businessAccountRepository.delete(businessAccount);
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
            mainAccount != null ? mainAccount.getAccountNumber() : null, // FIXED: Using full account number, not masked
            mainAccount != null ? mainAccount.getBalance() : 0.0,
            mainAccount != null ? mainAccount.getAccountType() : "PENDING",
            primaryCard != null ? primaryCard.getMaskedCardNumber() : null,
            primaryCard != null ? primaryCard.getStatus() : null
        );
    }
}
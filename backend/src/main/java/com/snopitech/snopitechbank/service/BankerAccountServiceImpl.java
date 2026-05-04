package com.snopitech.snopitechbank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.snopitech.snopitechbank.dto.*;
import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BankerAccountServiceImpl implements BankerAccountService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final BusinessAccountRepository businessAccountRepository;
    private final BankerAuditLogRepository auditLogRepository;
    private final TransactionService transactionService;
    private final PasswordService passwordService;
    private final SsnService ssnService;
    private final CardRepository cardRepository;
    private final Random random = new Random();

    private static final String ROUTING_NUMBER = "842917356";
    private static final String CHECKING_PREFIX = "58292";
    private static final String SAVINGS_PREFIX = "73420";

    public BankerAccountServiceImpl(EmployeeRepository employeeRepository,
                                     UserRepository userRepository,
                                     AccountRepository accountRepository,
                                     BusinessAccountRepository businessAccountRepository,
                                     BankerAuditLogRepository auditLogRepository,
                                     TransactionService transactionService,
                                     PasswordService passwordService,
                                     SsnService ssnService,
                                     CardRepository cardRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.businessAccountRepository = businessAccountRepository;
        this.auditLogRepository = auditLogRepository;
        this.transactionService = transactionService;
        this.passwordService = passwordService;
        this.ssnService = ssnService;
        this.cardRepository = cardRepository;
    }

    @Override
    public boolean verifyEmployeeExists(Long employeeId) {
        return employeeRepository.existsById(employeeId);
    }

    @Override
    public CustomerSearchResponse searchCustomer(CustomerSearchRequest request) {
        if (!verifyEmployeeExists(request.getEmployeeId())) {
            throw new RuntimeException("Employee not found with ID: " + request.getEmployeeId());
        }

        if (request.getSearchEmail() == null || request.getSearchEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required to search for a customer");
        }

        User customer = userRepository.findByEmailIgnoreCase(request.getSearchEmail().trim())
                .orElseThrow(() -> new RuntimeException("No customer found with email: " + request.getSearchEmail()));

        List<Account> customerAccounts = accountRepository.findByUserId(customer.getId());
        List<String> existingAccountTypes = customerAccounts.stream()
                .map(Account::getAccountType)
                .collect(Collectors.toList());

        List<String> allTypes = List.of("CHECKING", "SAVINGS", "BUSINESS");
        List<String> availableTypes = new ArrayList<>();
        for (String type : allTypes) {
            if (!existingAccountTypes.contains(type)) {
                availableTypes.add(type);
            }
        }

        CustomerSearchResponse response = new CustomerSearchResponse();
        response.setCustomerId(customer.getId());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setEmail(customer.getEmail());
        response.setMaskedSsn(customer.getSsnMasked());
        response.setPhone(customer.getPhone());
        response.setExistingAccounts(existingAccountTypes);
        response.setAvailableAccountTypes(availableTypes);

        return response;
    }

    @Override
    @Transactional
    public BankerCreateCustomerResponse createCustomer(BankerCreateCustomerRequest request) {
        // Verify employee exists
        if (!verifyEmployeeExists(request.getEmployeeId())) {
            return new BankerCreateCustomerResponse(false, "Employee not found");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new BankerCreateCustomerResponse(false, "Email already registered: " + request.getEmail());
        }

        // Validate age (18+)
        LocalDate dateOfBirth = request.getDateOfBirth();
        if (dateOfBirth != null) {
            int age = LocalDate.now().getYear() - dateOfBirth.getYear();
            if (LocalDate.now().getDayOfYear() < dateOfBirth.getDayOfYear()) {
                age--;
            }
            if (age < 18) {
                return new BankerCreateCustomerResponse(false, "Customer must be at least 18 years old");
            }
        }

        // Validate SSN
        String ssn = request.getSsn();
        if (ssn == null || ssn.replace("-", "").length() != 9) {
            return new BankerCreateCustomerResponse(false, "SSN must be 9 digits (format: 123-45-6789)");
        }

        try {
            // Encrypt SSN
            String encryptedSsn = ssnService.encryptSsn(ssn);
            String ssnLastFour = ssnService.getLastFour(ssn);

            // Encrypt password
            String encryptedPassword = passwordService.encryptPassword(request.getPassword());

            // Create user WITHOUT auto-creating accounts
            User newUser = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                encryptedPassword,
                request.getPhone(),
                request.getDateOfBirth(),
                encryptedSsn,
                ssnLastFour,
                request.getBirthCity(),
                request.getBirthState(),
                request.getBirthCountry()
            );

            // Set address
            newUser.setAddressLine1(request.getAddressLine1());
            newUser.setAddressLine2(request.getAddressLine2());
            newUser.setCity(request.getCity());
            newUser.setState(request.getState());
            newUser.setZipCode(request.getZipCode());
            newUser.setCountry(request.getCountry());

            // Set financial info
            newUser.setEmploymentStatus(request.getEmploymentStatus());
            newUser.setAnnualIncome(request.getAnnualIncomeAsDouble());
            newUser.setSourceOfFunds(request.getSourceOfFunds());
            newUser.setRiskTolerance(request.getRiskTolerance());
            newUser.setTaxBracket(request.getTaxBracket());

            // Generate customer ID
            String customerId = generateCustomerId();
            newUser.setCustomerId(customerId);
            newUser.setMemberSince(LocalDateTime.now());
            newUser.setProfileComplete(true);

            // Save user (NO accounts created automatically)
            User savedUser = userRepository.save(newUser);

            // Save security questions
            saveSecurityQuestions(savedUser.getId(), request);

            // Log audit
            logAudit(request.getEmployeeId(), savedUser.getId(), savedUser.getEmail(),
                    null, "CREATE_CUSTOMER", true, null, null);

            return new BankerCreateCustomerResponse(true, "Customer created successfully",
                    savedUser.getId(), savedUser.getFirstName(), savedUser.getLastName(), savedUser.getEmail());

        } catch (Exception e) {
            System.err.println("Failed to create customer: " + e.getMessage());
            e.printStackTrace();
            logAudit(request.getEmployeeId(), null, request.getEmail(),
                    null, "CREATE_CUSTOMER", false, e.getMessage(), null);
            return new BankerCreateCustomerResponse(false, "Failed to create customer: " + e.getMessage());
        }
    }

    private String generateCustomerId() {
        // Get the last customer ID and increment
        String lastId = userRepository.findLastCustomerId();
        if (lastId == null) {
            return "STB-0000001";
        }
        String numPart = lastId.substring(4);
        int num = Integer.parseInt(numPart) + 1;
        return String.format("STB-%07d", num);
    }

    private void saveSecurityQuestions(Long userId, BankerCreateCustomerRequest request) {
        try {
            List<Map<String, String>> questions = new ArrayList<>();
            
            Map<String, String> q1 = new HashMap<>();
            q1.put("question", request.getSecurityQuestion1());
            q1.put("answer", request.getSecurityAnswer1());
            questions.add(q1);
            
            Map<String, String> q2 = new HashMap<>();
            q2.put("question", request.getSecurityQuestion2());
            q2.put("answer", request.getSecurityAnswer2());
            questions.add(q2);
            
            Map<String, String> q3 = new HashMap<>();
            q3.put("question", request.getSecurityQuestion3());
            q3.put("answer", request.getSecurityAnswer3());
            questions.add(q3);
            
            ObjectMapper mapper = new ObjectMapper();
            String questionsJson = mapper.writeValueAsString(questions);
            
            // Update user with security questions JSON
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                user.setSecurityQuestions(questionsJson);
                userRepository.save(user);
            }
            
        } catch (Exception e) {
            System.err.println("Failed to save security questions: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public BankerOpenAccountResponse openInstantAccount(BankerOpenAccountRequest request) {
        if (!verifyEmployeeExists(request.getEmployeeId())) {
            return new BankerOpenAccountResponse(false, "Employee not found");
        }

        if (!request.isValid()) {
            return new BankerOpenAccountResponse(false, "Invalid request parameters");
        }

        User customer = userRepository.findById(request.getCustomerId()).orElse(null);

        if (customer == null) {
            logAudit(request.getEmployeeId(), request.getCustomerId(), null,
                    request.getAccountType(), "OPEN_" + request.getAccountType(),
                    false, "Customer not found", null);
            return new BankerOpenAccountResponse(false, "Customer not found");
        }

        List<Account> existingAccounts = accountRepository.findByUserId(customer.getId());
        boolean hasDuplicate = existingAccounts.stream()
                .anyMatch(acc -> acc.getAccountType().equals(request.getAccountType()));

        if (hasDuplicate) {
            logAudit(request.getEmployeeId(), customer.getId(), customer.getEmail(),
                    request.getAccountType(), "OPEN_" + request.getAccountType(),
                    false, "Customer already has a " + request.getAccountType() + " account", null);
            return new BankerOpenAccountResponse(false, 
                    "Customer already has a " + request.getAccountType() + " account");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        String employeeName = employee != null ? employee.getFirstName() + " " + employee.getLastName() : "Unknown";

        Account newAccount = createAccount(customer, request.getAccountType());

        if (request.getInitialDeposit() != null && request.getInitialDeposit() > 0) {
            newAccount.setBalance(request.getInitialDeposit());
            accountRepository.save(newAccount);
            
            try {
                com.snopitech.snopitechbank.dto.TransactionDTO txnDto = 
                    new com.snopitech.snopitechbank.dto.TransactionDTO();
                txnDto.setAccountId(newAccount.getId());
                txnDto.setAmount(request.getInitialDeposit());
                txnDto.setType("DEPOSIT");
                txnDto.setDescription("Initial deposit by banker " + employeeName);
                transactionService.createTransaction(txnDto);
            } catch (Exception e) {
                System.err.println("Failed to create transaction record: " + e.getMessage());
            }
        } else {
            newAccount.setBalance(0.0);
            accountRepository.save(newAccount);
        }

        logAudit(request.getEmployeeId(), customer.getId(), customer.getEmail(),
                request.getAccountType(), "OPEN_" + request.getAccountType(),
                true, null, newAccount.getAccountNumber());

        BankerOpenAccountResponse response = new BankerOpenAccountResponse();
        response.setSuccess(true);
        response.setMessage(request.getAccountType() + " account opened successfully");
        response.setAccountNumber(newAccount.getAccountNumber());
        response.setAccountType(newAccount.getAccountType());
        response.setBalance(newAccount.getBalance());
        response.setRoutingNumber(newAccount.getRoutingNumber());
        response.setOpenedByEmployeeId(request.getEmployeeId());
        response.setOpenedAt(LocalDateTime.now());

        return response;
    }

    @Override
    @Transactional
    public BankerOpenAccountResponse submitBusinessApplication(BankerBusinessApplicationRequest request) {
        if (!verifyEmployeeExists(request.getEmployeeId())) {
            return new BankerOpenAccountResponse(false, "Employee not found");
        }

        if (!request.isValid()) {
            return new BankerOpenAccountResponse(false, "Invalid request parameters: all fields required");
        }

        User customer = userRepository.findById(request.getCustomerId()).orElse(null);

        if (customer == null) {
            logAudit(request.getEmployeeId(), request.getCustomerId(), null,
                    "BUSINESS", "SUBMIT_BUSINESS_APP", false, "Customer not found", null);
            return new BankerOpenAccountResponse(false, "Customer not found");
        }

        List<BusinessAccount> existingBusinessAccounts = businessAccountRepository.findByUserId(customer.getId());
        boolean hasExisting = existingBusinessAccounts.stream()
                .anyMatch(ba -> !"REJECTED".equals(ba.getStatus()) && !"CLOSED".equals(ba.getStatus()));

        if (hasExisting) {
            logAudit(request.getEmployeeId(), customer.getId(), customer.getEmail(),
                    "BUSINESS", "SUBMIT_BUSINESS_APP", false, 
                    "Customer already has a pending or active business account", null);
            return new BankerOpenAccountResponse(false, 
                    "Customer already has a pending or active business account");
        }

        BusinessAccount businessAccount = new BusinessAccount();
        businessAccount.setUser(customer);
        businessAccount.setBusinessName(request.getBusinessName());
        businessAccount.setBusinessType(request.getBusinessType());
        businessAccount.setBusinessAddress(request.getBusinessAddress());
        businessAccount.setEin(request.getEin());
        businessAccount.setStatus("PENDING");
        businessAccount.setApplicationStatus("PENDING_REVIEW");
        businessAccount.setCreatedDate(LocalDateTime.now());
        businessAccount.setSubmittedDate(LocalDateTime.now());
        businessAccount.setVerified(false);
        
        if (request.getBusinessDocuments() != null) {
            businessAccount.setBusinessDocuments(request.getBusinessDocuments());
        }

        businessAccount.setIndustry("Not specified");
        businessAccount.setYearsInOperation(0);
        businessAccount.setAnnualRevenue(0.0);
        businessAccount.setNumberOfEmployees(0);
        businessAccount.setBusinessCity("Not specified");
        businessAccount.setBusinessState("Not specified");
        businessAccount.setBusinessZipCode("00000");
        businessAccount.setBusinessCountry("USA");
        businessAccount.setLegalStructure(request.getBusinessType());

        businessAccountRepository.save(businessAccount);

        logAudit(request.getEmployeeId(), customer.getId(), customer.getEmail(),
                "BUSINESS", "SUBMIT_BUSINESS_APP", true, null, null);

        BankerOpenAccountResponse response = new BankerOpenAccountResponse();
        response.setSuccess(true);
        response.setMessage("Business account application submitted successfully. Awaiting approval.");
        response.setAccountType("BUSINESS");
        response.setOpenedByEmployeeId(request.getEmployeeId());
        response.setOpenedAt(LocalDateTime.now());

        return response;
    }

    @Override
    @Transactional
    public CustomerOpenAccountResponse customerOpenAccount(CustomerOpenAccountRequest request) {
        if (!request.isValid()) {
            return new CustomerOpenAccountResponse(false, "Invalid request parameters");
        }
        
        User customer = userRepository.findById(request.getCustomerId()).orElse(null);
        
        if (customer == null) {
            return new CustomerOpenAccountResponse(false, "Customer not found");
        }
        
        // Check for duplicate account
        List<Account> existingAccounts = accountRepository.findByUserId(customer.getId());
        boolean hasDuplicate = existingAccounts.stream()
                .anyMatch(acc -> acc.getAccountType().equals(request.getAccountType()));
        
        if (hasDuplicate) {
            return new CustomerOpenAccountResponse(false, 
                    "You already have a " + request.getAccountType() + " account");
        }
        
        // Create account
        Account newAccount = createAccount(customer, request.getAccountType());
        
        // Create cards for CHECKING accounts only
        if ("CHECKING".equals(request.getAccountType())) {
            createCardsForAccount(newAccount);
        }
        
        return new CustomerOpenAccountResponse(true, 
                request.getAccountType() + " account opened successfully",
                newAccount.getAccountNumber(),
                newAccount.getAccountType(),
                newAccount.getBalance(),
                newAccount.getRoutingNumber(),
                LocalDateTime.now());
    }

    private Account createAccount(User user, String accountType) {
        Account account = new Account();
        account.setUser(user);
        account.setOwnerName(user.getFullName());
        account.setAccountType(accountType);
        account.setBalance(0.0);
        account.setRoutingNumber(ROUTING_NUMBER);
        
        String accountNumber;
        if ("CHECKING".equals(accountType)) {
            accountNumber = CHECKING_PREFIX + generateFiveDigitSuffix();
        } else if ("SAVINGS".equals(accountType)) {
            accountNumber = SAVINGS_PREFIX + generateFiveDigitSuffix();
        } else {
            throw new RuntimeException("Invalid account type: " + accountType);
        }
        account.setAccountNumber(accountNumber);
        
        Account savedAccount = accountRepository.save(account);
        
        // Create cards for CHECKING accounts only
        if ("CHECKING".equals(accountType)) {
            createCardsForAccount(savedAccount);
        }
        
        return savedAccount;
    }

    private void createCardsForAccount(Account account) {
        try {
            // Physical Card
            Card physicalCard = new Card();
            physicalCard.setAccount(account);
            physicalCard.setCardType("PHYSICAL");
            physicalCard.setCardNumber(generateCardNumber());
            physicalCard.setCardHolderName(account.getOwnerName());
            physicalCard.setExpiryDate(LocalDate.now().plusYears(4));
            physicalCard.setCvv(generateCVV());
            physicalCard.setStatus("ACTIVE");
            physicalCard.setIsVirtual(false);
            physicalCard.setPinHash("");
            physicalCard.setIssuedDate(LocalDateTime.now());
            cardRepository.save(physicalCard);
            
            // Virtual Card
            Card virtualCard = new Card();
            virtualCard.setAccount(account);
            virtualCard.setCardType("VIRTUAL");
            virtualCard.setCardNumber(generateCardNumber());
            virtualCard.setCardHolderName(account.getOwnerName());
            virtualCard.setExpiryDate(LocalDate.now().plusYears(4));
            virtualCard.setCvv(generateCVV());
            virtualCard.setStatus("ACTIVE");
            virtualCard.setIsVirtual(true);
            virtualCard.setPinHash("");
            virtualCard.setIssuedDate(LocalDateTime.now());
            cardRepository.save(virtualCard);
            
            System.out.println("✅ Created PHYSICAL and VIRTUAL cards for account: " + account.getAccountNumber());
        } catch (Exception e) {
            System.err.println("Failed to create cards: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Card creation failed: " + e.getMessage());
        }
    }

    private String generateCardNumber() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String generateCVV() {
        return String.format("%03d", random.nextInt(1000));
    }

    private String generateFiveDigitSuffix() {
        int num = 10000 + random.nextInt(90000);
        return String.valueOf(num);
    }

    private void logAudit(Long employeeId, Long customerId, String customerEmail,
                          String accountType, String actionType, boolean success,
                          String failureReason, String accountNumber) {
        try {
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            String employeeName = employee != null ? employee.getFirstName() + " " + employee.getLastName() : "Unknown";
            
            if (customerEmail == null && customerId != null) {
                User user = userRepository.findById(customerId).orElse(null);
                customerEmail = user != null ? user.getEmail() : "Unknown";
            }

            BankerAuditLog auditLog = new BankerAuditLog();
            auditLog.setEmployeeId(employeeId);
            auditLog.setEmployeeName(employeeName);
            auditLog.setCustomerId(customerId);
            auditLog.setCustomerEmail(customerEmail != null ? customerEmail : "Unknown");
            auditLog.setActionType(actionType);
            auditLog.setAccountType(accountType);
            auditLog.setAccountNumber(accountNumber);
            auditLog.setStatus(success ? "SUCCESS" : "FAILED");
            auditLog.setFailureReason(failureReason);
            auditLog.setTimestamp(LocalDateTime.now());
            
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}
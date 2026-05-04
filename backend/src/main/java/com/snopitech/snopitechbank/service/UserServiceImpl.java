package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.SafeProfileUpdateDTO;
import com.snopitech.snopitechbank.dto.UpdateUserProfileDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.BusinessAccount;
import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditApplication;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.Card;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.repository.BusinessAccountRepository;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.VerificationCodeRepository;
import com.snopitech.snopitechbank.repository.CreditApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings("unused")
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AccountServiceImpl accountService;
    private final CustomerIdService customerIdService;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final BusinessAccountRepository businessAccountRepository;
    private final CreditAccountRepository creditAccountRepository;
    private final CreditCardRepository creditCardRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final CreditApplicationRepository creditApplicationRepository;

    public UserServiceImpl(UserRepository userRepository,
                           AccountServiceImpl accountService,
                           CustomerIdService customerIdService,
                           AccountRepository accountRepository,
                           CardRepository cardRepository,
                           BusinessAccountRepository businessAccountRepository,
                           CreditAccountRepository creditAccountRepository,
                           CreditCardRepository creditCardRepository,
                           VerificationCodeRepository verificationCodeRepository,
                           CreditApplicationRepository creditApplicationRepository) {
        this.userRepository = userRepository;
        this.accountService = accountService;
        this.customerIdService = customerIdService;
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.businessAccountRepository = businessAccountRepository;
        this.creditAccountRepository = creditAccountRepository;
        this.creditCardRepository = creditCardRepository;
        this.verificationCodeRepository = verificationCodeRepository;
        this.creditApplicationRepository = creditApplicationRepository;
    }

@Override
public User createUser(User user) {
    // Generate customer ID based on last ID, not count
    String lastCustomerId = userRepository.findLastCustomerId();
    String customerId;

    if (lastCustomerId == null) {
        customerId = "STB-0000001";
    } else {
        // Extract number from STB-0000001 format
        int lastNumber = Integer.parseInt(lastCustomerId.substring(4));
        int nextNumber = lastNumber + 1;
        customerId = "STB-" + String.format("%07d", nextNumber);
    }
    user.setCustomerId(customerId);
    
    User savedUser = userRepository.save(user);

    // ONLY create Checking account (Savings and Loan removed)
    Account checking = accountService.createCheckingAccount(savedUser);
    savedUser.getAccounts().add(checking);

    return userRepository.save(savedUser);
}
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // ===== STEP 0: DELETE VERIFICATION CODES FIRST =====
        verificationCodeRepository.deleteByUser(user);
        
        // ===== STEP 0.5: DELETE CREDIT APPLICATIONS =====
        List<CreditApplication> creditApplications = creditApplicationRepository.findByUserId(id);
        if (creditApplications != null && !creditApplications.isEmpty()) {
            creditApplicationRepository.deleteAll(creditApplications);
            System.out.println("✅ Deleted " + creditApplications.size() + " credit applications for user ID: " + id);
        }
        
        // ===== STEP 1: DELETE CREDIT ACCOUNTS AND THEIR CARDS =====
        List<CreditAccount> creditAccounts = creditAccountRepository.findByUserId(id);
        for (CreditAccount creditAccount : creditAccounts) {
            // Delete all credit cards associated with this credit account
            List<CreditCard> creditCards = creditCardRepository.findByCreditAccountId(creditAccount.getId());
            if (creditCards != null && !creditCards.isEmpty()) {
                creditCardRepository.deleteAll(creditCards);
            }
            // Delete the credit account
            creditAccountRepository.delete(creditAccount);
        }
        
        // ===== STEP 2: DELETE BUSINESS ACCOUNTS AND THEIR CARDS =====
        List<BusinessAccount> businessAccounts = businessAccountRepository.findByUserId(id);
        for (BusinessAccount businessAccount : businessAccounts) {
            // If business account has a linked main account, delete it
            if (businessAccount.getAccount() != null) {
                Account linkedAccount = businessAccount.getAccount();
                // Delete cards for the linked account
                List<Card> businessCards = cardRepository.findByAccountId(linkedAccount.getId());
                if (businessCards != null && !businessCards.isEmpty()) {
                    cardRepository.deleteAll(businessCards);
                }
                // Delete the linked account
                accountRepository.delete(linkedAccount);
            }
            // Delete the business account record
            businessAccountRepository.delete(businessAccount);
        }
        
        // ===== STEP 3: DELETE REGULAR ACCOUNTS AND THEIR CARDS =====
        for (Account account : user.getAccounts()) {
            // Delete all cards associated with this account
            List<Card> cards = cardRepository.findByAccountId(account.getId());
            if (cards != null && !cards.isEmpty()) {
                cardRepository.deleteAll(cards);
            }
            // Delete the account
            accountRepository.delete(account);
        }
        
        // ===== STEP 4: FINALLY DELETE THE USER =====
        userRepository.delete(user);
    }

    @Override
    public User updateUserProfile(Long userId, UpdateUserProfileDTO dto) {
        User user = getUserById(userId);

        if (dto.getEmail() != null) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("This email is already in use.");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getPassword() != null) {
            if (!isValidPassword(dto.getPassword())) {
                throw new IllegalArgumentException(
                        "Your password must be 8-12 characters, include uppercase, lowercase, number, and special character."
                );
            }
            user.setPassword(dto.getPassword());
        }

        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }

        if (dto.getAddressLine1() != null) user.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) user.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getZipCode() != null) user.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());

        return userRepository.save(user);
    }

    @Override
    public User updateSecurityQuestions(Long userId, String securityQuestions) {
        User user = getUserById(userId);
        user.setSecurityQuestions(securityQuestions);
        return userRepository.save(user);
    }

    @Override
    public User completeUserProfile(Long userId) {
        User user = getUserById(userId);
        user.setProfileComplete(true);
        return userRepository.save(user);
    }

    @Override
    public User updateUserProfileSafe(Long userId, SafeProfileUpdateDTO dto) {
        User user = getUserById(userId);

        // Update phone if provided
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            user.setPhone(dto.getPhone());
        }

        // Update address fields if provided
        if (dto.getAddressLine1() != null) user.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) user.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getZipCode() != null) user.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        
        // ⭐ EXISTING FINANCIAL FIELDS
        if (dto.getEmploymentStatus() != null) {
            user.setEmploymentStatus(dto.getEmploymentStatus());
        }
        if (dto.getAnnualIncome() != null) {
            user.setAnnualIncome(dto.getAnnualIncome());
        }
        if (dto.getRiskTolerance() != null) {
            user.setRiskTolerance(dto.getRiskTolerance());
        }
        
        // ⭐ TWO NEW FIELDS ADDED - Source of Funds and Tax Bracket
        if (dto.getSourceOfFunds() != null) {
            user.setSourceOfFunds(dto.getSourceOfFunds());
        }
        if (dto.getTaxBracket() != null) {
            user.setTaxBracket(dto.getTaxBracket());
        }

        return userRepository.save(user);
    }

    private boolean isValidPassword(String password) {
        return password.length() >= 8 &&
               password.length() <= 12 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[a-z].*") &&
               password.matches(".*\\d.*") &&
               password.matches(".*[!@#$%^&*()].*");
    }

    @Override
    public User getUserByAccountNumber(String accountNumber) {
        Account account = accountService.getAccountByAccountNumber(accountNumber);
        User user = account.getUser();
        
        if (user == null) {
            throw new IllegalArgumentException("No user found for account number: " + accountNumber);
        }
        
        // Don't send password in response
        user.setPassword(null);
        
        return user;
    }

    // ⭐ NEW: Find user by email (case-insensitive)
    @Override
    public User findByEmailIgnoreCase(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
    @Override
public List<User> searchUsersByName(String name) {
    return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name);
}
}
package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.SafeProfileUpdateDTO;
import com.snopitech.snopitechbank.dto.UpdateUserProfileDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.model.Card;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AccountServiceImpl accountService;
    private final CustomerIdService customerIdService;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;

    public UserServiceImpl(UserRepository userRepository,
                           AccountServiceImpl accountService,
                           CustomerIdService customerIdService,
                           AccountRepository accountRepository,
                           CardRepository cardRepository) {
        this.userRepository = userRepository;
        this.accountService = accountService;
        this.customerIdService = customerIdService;
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
    }

    @Override
    public User createUser(User user) {
        long userCount = userRepository.count();
        String customerId = customerIdService.generateNextId(userCount);
        user.setCustomerId(customerId);
        
        User savedUser = userRepository.save(user);

        Account checking = accountService.createCheckingAccount(savedUser);
        Account savings = accountService.createSavingsAccount(savedUser);

        savedUser.getAccounts().add(checking);
        savedUser.getAccounts().add(savings);

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
        
        // First, delete all cards associated with user's accounts
        for (Account account : user.getAccounts()) {
            List<Card> cards = cardRepository.findByAccountId(account.getId());
            if (cards != null && !cards.isEmpty()) {
                cardRepository.deleteAll(cards);
            }
        }
        
        // Then delete all accounts (this will now work because cards are gone)
        for (Account account : user.getAccounts()) {
            accountRepository.delete(account);
        }
        
        // Finally delete the user
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
}
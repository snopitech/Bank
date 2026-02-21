package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.SafeProfileUpdateDTO;
import com.snopitech.snopitechbank.dto.UpdateUserProfileDTO;
import com.snopitech.snopitechbank.model.User;

import java.util.List;

public interface UserService {

    User createUser(User user);
    List<User> getAllUsers();
    User getUserById(Long id);
    void deleteUser(Long id);
    User updateUserProfile(Long userId, UpdateUserProfileDTO dto);
    
    // ⭐ ADD THESE TWO METHOD SIGNATURES
    User updateSecurityQuestions(Long userId, String securityQuestions);
    User completeUserProfile(Long userId);
    
    // ⭐ ADD THIS NEW METHOD SIGNATURE (STEP 4)
    User updateUserProfileSafe(Long userId, SafeProfileUpdateDTO dto);
    
    // ⭐ NEW: Find user by account number for admin lookup
    User getUserByAccountNumber(String accountNumber);
}
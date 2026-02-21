package com.snopitech.snopitechbank.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }
    
    public String encryptPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return passwordEncoder.encode(plainPassword);
    }
    
    public boolean verifyPassword(String plainPassword, String storedPassword) {
        if (plainPassword == null || storedPassword == null) {
            return false;
        }
        
        // Check if stored password is BCrypt hash or plain text
        if (isBcryptHash(storedPassword)) {
            // New user: BCrypt hash
            return passwordEncoder.matches(plainPassword, storedPassword);
        } else {
            // Old user: Plain text (legacy support)
            return plainPassword.equals(storedPassword);
        }
    }
    
    private boolean isBcryptHash(String password) {
        return password != null && 
               password.length() >= 60 && 
               (password.startsWith("$2a$") || 
                password.startsWith("$2b$") || 
                password.startsWith("$2y$"));
    }
    
    public boolean needsUpgrade(String storedPassword) {
        return !isBcryptHash(storedPassword);
    }
    
    public String upgradePassword(String plainPassword) {
        return encryptPassword(plainPassword);
    }
}
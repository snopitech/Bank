// src/main/java/com/snopitech/snopitechbank/service/CustomerIdService.java
package com.snopitech.snopitechbank.service;

import org.springframework.stereotype.Service;

@Service
public class CustomerIdService {
    
    private static final String PREFIX = "STB-";
    private static final int ID_LENGTH = 7;
    
    public String generateNextId(long existingUserCount) {
        // Start numbering from 1
        long nextNumber = existingUserCount + 1;
        
        // Format: STB-0000001 (7 digits with leading zeros)
        String numericPart = String.format("%0" + ID_LENGTH + "d", nextNumber);
        
        return PREFIX + numericPart;
    }
}
package com.snopitech.snopitechbank.service;

import org.springframework.stereotype.Service;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Service
public class SsnService {
    
    public String encryptSsn(String ssn) {
        if (ssn == null || ssn.trim().isEmpty()) {
            throw new IllegalArgumentException("SSN cannot be null or empty");
        }
        
        // Remove dashes and spaces
        String cleanSsn = ssn.replace("-", "").replace(" ", "");
        
        if (cleanSsn.length() != 9) {
            throw new IllegalArgumentException("SSN must be 9 digits after removing dashes");
        }
        
        // For now, use Base64 encoding
        String encoded = Base64.getEncoder()
            .encodeToString(cleanSsn.getBytes(StandardCharsets.UTF_8));
        
        return "ENC-B64:" + encoded;
    }
    
    public String getLastFour(String ssn) {
        if (ssn == null) {
            return "";
        }
        
        String cleanSsn = ssn.replace("-", "").replace(" ", "");
        
        if (cleanSsn.length() >= 4) {
            return cleanSsn.substring(cleanSsn.length() - 4);
        }
        
        return cleanSsn;
    }
    
    // For debugging/testing only
    public String decryptSsn(String encryptedSsn) {
        if (encryptedSsn == null || !encryptedSsn.startsWith("ENC-B64:")) {
            return encryptedSsn;
        }
        
        try {
            String encoded = encryptedSsn.substring(8);
            byte[] decodedBytes = Base64.getDecoder().decode(encoded);
            return new String(decodedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "DECRYPTION_ERROR";
        }
    }
}
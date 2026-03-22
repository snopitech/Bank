package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Admin;

import org.apache.commons.codec.binary.Base32;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base32;

@SuppressWarnings("unused")
@Service
public class TOTPService {

    

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int SECRET_SIZE = 20; // 160 bits
    private static final int CODE_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;
    private static final String HMAC_ALGORITHM = "HmacSHA1";

    /**
     * Generate a new TOTP secret for an admin
     * @return Base32 encoded secret
     */
  public String generateSecret() {
    byte[] bytes = new byte[SECRET_SIZE];
    secureRandom.nextBytes(bytes);
    // Convert to Base32 (standard for TOTP)
    Base32 base32 = new Base32();
    return base32.encodeAsString(bytes).replace("=", "");
}
/**
 * Generate a TOTP code from a secret
 * @param secret The Base32 encoded secret
 * @return 6-digit TOTP code
 */
public String generateTOTP(String secret) {
    try {
        // Decode Base32 secret
        Base32 base32 = new Base32();
        byte[] secretBytes = base32.decode(secret);
        
        long timeWindow = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;
        
        // Convert time window to bytes
        byte[] timeBytes = new byte[8];
        for (int i = 7; i >= 0; i--) {
            timeBytes[i] = (byte) (timeWindow & 0xff);
            timeWindow >>= 8;
        }
        
        // Calculate HMAC
        SecretKeySpec signingKey = new SecretKeySpec(secretBytes, HMAC_ALGORITHM);
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(signingKey);
        byte[] hash = mac.doFinal(timeBytes);
        
        // Get offset and 4 bytes for code
        int offset = hash[hash.length - 1] & 0xf;
        int binary = ((hash[offset] & 0x7f) << 24) |
                    ((hash[offset + 1] & 0xff) << 16) |
                    ((hash[offset + 2] & 0xff) << 8) |
                    (hash[offset + 3] & 0xff);
        
        // Generate 6-digit code
        int code = binary % (int) Math.pow(10, CODE_DIGITS);
        return String.format("%06d", code);
        
    } catch (Exception e) {
        throw new RuntimeException("Failed to generate TOTP", e);
    }
}

/**
 * Verify a TOTP code with extended time window
 * @param secret The Base32 encoded secret
 * @param code The 6-digit code to verify
 * @return true if code is valid
 */
public boolean verifyTOTP(String secret, String code) {
    // Check current time window
    String currentCode = generateTOTP(secret);
    if (currentCode.equals(code)) {
        return true;
    }
    
    // Check previous time window (30 seconds behind)
    String previousCode = generateTOTPForTimeOffset(secret, -1);
    if (previousCode.equals(code)) {
        return true;
    }
    
    // Check next time window (30 seconds ahead)
    String nextCode = generateTOTPForTimeOffset(secret, 1);
    if (nextCode.equals(code)) {
        return true;
    }
    
    // Check two windows behind (60 seconds) for larger drift
    String twoWindowsBehindCode = generateTOTPForTimeOffset(secret, -2);
    if (twoWindowsBehindCode.equals(code)) {
        return true;
    }
    
    // Check two windows ahead (60 seconds)
    String twoWindowsAheadCode = generateTOTPForTimeOffset(secret, 2);
    if (twoWindowsAheadCode.equals(code)) {
        return true;
    }
    
    return false;
}

/**
 * Generate TOTP code for a specific time offset
 * @param secret The Base32 encoded secret
 * @param windowOffset Number of time windows to offset (positive for future, negative for past)
 * @return 6-digit TOTP code
 */
private String generateTOTPForTimeOffset(String secret, int windowOffset) {
    try {
        // Decode Base32 secret
        Base32 base32 = new Base32();
        byte[] secretBytes = base32.decode(secret);
        
        long timeWindow = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;
        timeWindow += windowOffset;
        
        // Convert time window to bytes
        byte[] timeBytes = new byte[8];
        for (int i = 7; i >= 0; i--) {
            timeBytes[i] = (byte) (timeWindow & 0xff);
            timeWindow >>= 8;
        }
        
        // Calculate HMAC
        SecretKeySpec signingKey = new SecretKeySpec(secretBytes, HMAC_ALGORITHM);
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(signingKey);
        byte[] hash = mac.doFinal(timeBytes);
        
        // Get offset and 4 bytes for code
        int offset = hash[hash.length - 1] & 0xf;
        int binary = ((hash[offset] & 0x7f) << 24) |
                    ((hash[offset + 1] & 0xff) << 16) |
                    ((hash[offset + 2] & 0xff) << 8) |
                    (hash[offset + 3] & 0xff);
        
        // Generate 6-digit code
        int code = binary % (int) Math.pow(10, CODE_DIGITS);
        return String.format("%06d", code);
        
    } catch (Exception e) {
        return "000000"; // Return invalid code on error
    }
}

    /**
     * Generate a URI for QR code (for Microsoft Authenticator)
     * @param admin The admin account
     * @param secret The TOTP secret
     * @return URI string for QR code
     */
    public String generateTOTPURI(Admin admin, String secret) {
        String issuer = "SnopitechBank";
        String account = admin.getUsername() + "@" + issuer;
        
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
            issuer, account, secret, issuer, CODE_DIGITS, TIME_STEP_SECONDS
        );
    }
  
/**
 * Debug method to check TOTP calculation
 */
public void debugTOTP(String secret) {
    try {
        System.out.println("=== TOTP DEBUG ===");
        System.out.println("Secret: " + secret);
        
        // Generate current code
        String currentCode = generateTOTP(secret);
        System.out.println("Current code from server: " + currentCode);
        
        // Check previous window
        byte[] secretBytes = Base64.getDecoder().decode(secret);
        long timeWindow = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;
        System.out.println("Current time window: " + timeWindow);
        
        // Show what the server expects
        System.out.println("Server time: " + Instant.now());
        
    } catch (Exception e) {
        System.err.println("Debug error: " + e.getMessage());
    }
}

    /**
 * Generate a URI for QR code (for Microsoft Authenticator) - Employee version
 * @param employeeName The employee's name
 * @param employeeEmail The employee's email
 * @param secret The TOTP secret
 * @return URI string for QR code
 */
public String generateTOTPURIForEmployee(String employeeName, String employeeEmail, String secret) {
    String issuer = "SnopitechBank";
    String account = employeeEmail; // or employeeName + "@" + issuer
    
    return String.format(
        "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
        issuer, account, secret, issuer, CODE_DIGITS, TIME_STEP_SECONDS
    );
}

}

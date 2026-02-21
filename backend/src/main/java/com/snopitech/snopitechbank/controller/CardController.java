package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.*;
import com.snopitech.snopitechbank.service.CardService;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Card;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    @Autowired
    private CardService cardService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    @SuppressWarnings("unused")
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ==================== USER ENDPOINTS ====================

    /**
     * GET /api/cards/user/{userId} - List all cards for a user (masked numbers)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CardDTO>> getUserCards(@PathVariable Long userId) {
        List<CardDTO> cards = cardService.getCardsByUser(userId);
        return ResponseEntity.ok(cards);
    }

    /**
     * GET /api/cards/account/{accountId} - List all cards for an account (masked numbers)
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<CardDTO>> getAccountCards(@PathVariable Long accountId) {
        List<CardDTO> cards = cardService.getCardsByAccount(accountId);
        return ResponseEntity.ok(cards);
    }

    /**
     * GET /api/cards/{cardId} - Get card details (masked)
     */
    @GetMapping("/{cardId}")
    public ResponseEntity<CardDTO> getCardById(@PathVariable Long cardId) {
        CardDTO card = cardService.getCardById(cardId);
        return ResponseEntity.ok(card);
    }

    /**
     * GET /api/cards/{cardId}/limits - Get spending limits
     */
    @GetMapping("/{cardId}/limits")
    public ResponseEntity<CardDTO> getCardLimits(@PathVariable Long cardId) {
        CardDTO card = cardService.getCardLimits(cardId);
        return ResponseEntity.ok(card);
    }

    /**
     * POST /api/cards/{cardId}/reveal - Temporarily reveal full card number (user)
     * This creates a temporary token that expires in 30 seconds
     */
    @PostMapping("/{cardId}/reveal")
    public ResponseEntity<?> revealCardNumber(@PathVariable Long cardId) {
        try {
            @SuppressWarnings("unused")
            Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
            
            // Generate a temporary token (in production, use JWT with 30s expiry)
            String tempToken = generateTempToken();
            
            // Store in cache with 30 second expiry (you'll need a cache service)
            // cacheService.put(tempToken, card.getCardNumber(), 30);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", tempToken);
            response.put("expiresIn", 30);
            response.put("message", "Token valid for 30 seconds");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/cards/reveal-with-token - Get full card number with token
     */
    @PostMapping("/reveal-with-token")
    public ResponseEntity<?> getFullNumberWithToken(@RequestParam String token) {
        try {
            // Retrieve from cache
            // String cardNumber = cacheService.get(token);
            
            // For demo, we'll just return a mock response
            // In production, validate token and get from cache
            
            return ResponseEntity.ok(Map.of(
                "cardNumber", "5169205359253094", // This would come from cache
                "expiresIn", "30 seconds"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid or expired token"));
        }
    }

    /**
     * POST /api/cards/{cardId}/activate - Activate new card
     */
    @PostMapping("/{cardId}/activate")
    public ResponseEntity<CardDTO> activateCard(
            @PathVariable Long cardId,
            @RequestParam String pin) {
        
        if (pin == null || pin.length() != 4 || !pin.matches("\\d+")) {
            return ResponseEntity.badRequest().build();
        }
        
        CardDTO activatedCard = cardService.activateCard(cardId, pin);
        return ResponseEntity.ok(activatedCard);
    }

    /**
     * PUT /api/cards/{cardId}/status - Freeze/unfreeze card
     */
    @PutMapping("/{cardId}/status")
    public ResponseEntity<CardDTO> updateCardStatus(
            @PathVariable Long cardId,
            @Valid @RequestBody UpdateCardStatusRequest request) {
        CardDTO updatedCard = cardService.updateCardStatus(cardId, request);
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * POST /api/cards/{cardId}/replace - Request replacement
     */
    @PostMapping("/{cardId}/replace")
    public ResponseEntity<CardDTO> replaceCard(
            @PathVariable Long cardId,
            @Valid @RequestBody ReplaceCardRequest request) {
        CardDTO newCard = cardService.replaceCard(cardId, request);
        return new ResponseEntity<>(newCard, HttpStatus.CREATED);
    }

    /**
     * PUT /api/cards/{cardId}/pin - Update PIN
     */
    @PutMapping("/{cardId}/pin")
    public ResponseEntity<CardDTO> changePin(
            @PathVariable Long cardId,
            @Valid @RequestBody UpdatePinRequest request) {
        CardDTO updatedCard = cardService.changePin(cardId, request);
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * POST /api/cards/{cardId}/design - Custom card design
     */
    @PostMapping("/{cardId}/design")
    public ResponseEntity<CardDTO> updateCardDesign(
            @PathVariable Long cardId,
            @Valid @RequestBody CardDesignRequest request) {
        CardDTO updatedCard = cardService.updateCardDesign(cardId, request);
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * PUT /api/cards/{cardId}/limits - Update spending limits
     */
    @PutMapping("/{cardId}/limits")
    public ResponseEntity<CardDTO> updateCardLimits(
            @PathVariable Long cardId,
            @Valid @RequestBody UpdateCardLimitsRequest request) {
        CardDTO updatedCard = cardService.updateCardLimits(cardId, request);
        return ResponseEntity.ok(updatedCard);
    }

    // ==================== NEW ZIP CODE VERIFICATION ENDPOINT ====================

    /**
     * POST /api/cards/verify-with-zip - Verify card using ZIP code instead of CVV
     * This allows users to make purchases by entering their billing ZIP code
     */
    @PostMapping("/verify-with-zip")
    public ResponseEntity<?> verifyCardWithZip(
            @RequestParam String cardNumber,
            @RequestParam String zipCode) {
        
        try {
            boolean isValid = cardService.verifyCardWithZip(cardNumber, zipCode);
            
            if (isValid) {
                return ResponseEntity.ok().body(Map.of(
                    "valid", true,
                    "message", "Card verified successfully with ZIP code",
                    "timestamp", LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                            "valid", false,
                            "message", "Invalid card or ZIP code",
                            "timestamp", LocalDateTime.now()
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * ADMIN ONLY - Get full card details for printing
     * GET /api/cards/admin/{cardId}/print
     */
    @GetMapping("/admin/{cardId}/print")
    public ResponseEntity<?> getFullCardDetailsForPrinting(@PathVariable Long cardId) {
        try {
            // TODO: Add proper admin authentication
            // @PreAuthorize("hasRole('ADMIN')")
            
            Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
            
            // In production, decrypt CVV (store encrypted but reversible for admin)
            String decryptedCvv = decryptCvvForAdmin(card.getCvv());
            
            Map<String, Object> fullDetails = new HashMap<>();
            fullDetails.put("id", card.getId());
            fullDetails.put("cardNumber", card.getCardNumber());
            fullDetails.put("formattedCardNumber", formatCardNumber(card.getCardNumber()));
            fullDetails.put("cardHolderName", card.getCardHolderName());
            fullDetails.put("expiryDate", card.getExpiryDate());
            fullDetails.put("expiryMonth", card.getExpiryDate().getMonthValue());
            fullDetails.put("expiryYear", card.getExpiryDate().getYear());
            fullDetails.put("cvv", decryptedCvv);
            fullDetails.put("cardType", card.getCardType());
            fullDetails.put("isVirtual", card.getIsVirtual());
            fullDetails.put("status", card.getStatus());
            fullDetails.put("designColor", card.getDesignColor());
            
            // Account details
            fullDetails.put("accountId", card.getAccount().getId());
            fullDetails.put("accountNumber", card.getAccount().getAccountNumber());
            fullDetails.put("routingNumber", card.getAccount().getRoutingNumber());
            fullDetails.put("ownerName", card.getAccount().getOwnerName());
            
            // Issuance details
            fullDetails.put("issuedDate", card.getIssuedDate());
            fullDetails.put("issuedBy", "System"); // In production, get from logged-in admin
            
            // For printing
            fullDetails.put("printDate", LocalDateTime.now());
            
            // Log admin access for audit
            logAdminAccess(cardId, "PRINT_VIEW");
            
            return ResponseEntity.ok(fullDetails);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ADMIN ONLY - Get all cards with full details (for admin panel)
     * GET /api/cards/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllCardsForAdmin() {
        try {
            List<Card> cards = cardRepository.findAll();
            List<Map<String, Object>> cardList = new ArrayList<>();
            
            for (Card card : cards) {
                Map<String, Object> cardInfo = new HashMap<>();
                cardInfo.put("id", card.getId());
                cardInfo.put("cardNumber", card.getCardNumber());
                cardInfo.put("maskedNumber", card.getMaskedCardNumber());
                cardInfo.put("cardHolderName", card.getCardHolderName());
                cardInfo.put("expiryDate", card.getExpiryDate());
                cardInfo.put("status", card.getStatus());
                cardInfo.put("cardType", card.getCardType());
                cardInfo.put("accountId", card.getAccount().getId());
                cardInfo.put("accountNumber", card.getAccount().getAccountNumber());
                cardInfo.put("ownerName", card.getAccount().getOwnerName());
                cardInfo.put("issuedDate", card.getIssuedDate());
                cardList.add(cardInfo);
            }
            
            return ResponseEntity.ok(cardList);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ADMIN ONLY - Print multiple cards (batch printing)
     * POST /api/cards/admin/print-batch
     */
    @PostMapping("/admin/print-batch")
    public ResponseEntity<?> printCardsBatch(@RequestBody List<Long> cardIds) {
        try {
            List<Map<String, Object>> cardsToPrint = new ArrayList<>();
            
            for (Long cardId : cardIds) {
                Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new RuntimeException("Card not found: " + cardId));
                
                Map<String, Object> cardInfo = new HashMap<>();
                cardInfo.put("id", card.getId());
                cardInfo.put("cardNumber", card.getCardNumber());
                cardInfo.put("cardHolderName", card.getCardHolderName());
                cardInfo.put("expiryDate", card.getExpiryDate());
                cardInfo.put("cvv", decryptCvvForAdmin(card.getCvv()));
                cardInfo.put("cardType", card.getCardType());
                
                cardsToPrint.add(cardInfo);
                
                // Log batch print
                logAdminAccess(cardId, "BATCH_PRINT");
            }
            
            return ResponseEntity.ok(Map.of(
                "cards", cardsToPrint,
                "totalCards", cardsToPrint.size(),
                "printDate", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== TEMPORARY ENDPOINT FOR EXISTING USERS ====================

    /**
     * POST /api/cards/generate-for-user/{userId} - Generate cards for existing user (TEMPORARY)
     */
    @PostMapping("/generate-for-user/{userId}")
    public ResponseEntity<?> generateCardsForUser(@PathVariable Long userId) {
        try {
            List<Account> accounts = accountRepository.findByUserId(userId);
            List<Map<String, Object>> results = new ArrayList<>();
            
            for (Account account : accounts) {
                if ("CHECKING".equals(account.getAccountType())) {
                    List<Card> existingCards = cardRepository.findByAccountId(account.getId());
                    if (existingCards.isEmpty()) {
                        Card physicalCard = cardService.generateCardForAccount(account, "PHYSICAL");
                        Card virtualCard = cardService.generateCardForAccount(account, "VIRTUAL");
                        
                        Map<String, Object> result = new HashMap<>();
                        result.put("accountId", account.getId());
                        result.put("accountNumber", account.getAccountNumber());
                        result.put("ownerName", account.getOwnerName());
                        result.put("physicalCardId", physicalCard.getId());
                        result.put("virtualCardId", virtualCard.getId());
                        result.put("physicalCardNumber", physicalCard.getMaskedCardNumber());
                        result.put("virtualCardNumber", virtualCard.getMaskedCardNumber());
                        result.put("message", "Cards generated successfully");
                        results.add(result);
                    } else {
                        Map<String, Object> result = new HashMap<>();
                        result.put("accountId", account.getId());
                        result.put("accountNumber", account.getAccountNumber());
                        result.put("ownerName", account.getOwnerName());
                        result.put("existingCardCount", existingCards.size());
                        result.put("message", "Cards already exist for this account");
                        results.add(result);
                    }
                }
            }
            
            if (results.isEmpty()) {
                return ResponseEntity.ok().body(Map.of(
                    "message", "No checking accounts found for user",
                    "userId", userId
                ));
            }
            
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    // ==================== VERIFICATION ENDPOINT ====================

    /**
     * POST /api/cards/verify - Verify card for transactions (with CVV and PIN)
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCard(
            @RequestParam String cardNumber,
            @RequestParam String cvv,
            @RequestParam String pin) {
        
        boolean isValid = cardService.verifyCard(cardNumber, cvv, pin);
        
        if (isValid) {
            return ResponseEntity.ok().body(new VerifyResponse(true, "Card verified successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VerifyResponse(false, "Invalid card credentials"));
        }
    }

    // ==================== HELPER METHODS ====================

    private String generateTempToken() {
        return java.util.UUID.randomUUID().toString();
    }

    private String formatCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() != 16) return cardNumber;
        return cardNumber.replaceAll("(.{4})", "$1-").substring(0, 19);
    }

    private String decryptCvvForAdmin(String encryptedCvv) {
        // In production, implement proper decryption
        // This is just a placeholder
        return "123"; // Mock CVV for demo
    }

    private void logAdminAccess(Long cardId, String action) {
        // In production, save to audit log table
        System.out.println("ADMIN AUDIT: Card ID " + cardId + " - " + action + 
                          " at " + LocalDateTime.now());
    }

    // Inner class for verification response
    static class VerifyResponse {
        private boolean valid;
        private String message;

        public VerifyResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.service.CreditCardService;
import com.snopitech.snopitechbank.service.CreditAccountService;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit")
public class CreditCardController {

    @Autowired
    private CreditCardService creditCardService;

    @Autowired
    private CreditAccountService creditAccountService;

    @Autowired
    private UserRepository userRepository;

    // Helper method to get user from sessionId
    private User getUserFromSession(String sessionId) {
        return userRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Get all cards for an account (masked)
     * GET /api/credit/accounts/{accountId}/cards
     */
    @GetMapping("/accounts/{accountId}/cards")
    public ResponseEntity<?> getAccountCards(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long accountId) {
        try {
            User user = getUserFromSession(sessionId);
            
            // Verify account belongs to user
            var account = creditAccountService.getAccount(accountId);
            if (!account.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view these cards"));
            }

            List<CreditCard> cards = creditCardService.getAccountCards(accountId);
            
            // Mask sensitive info for normal viewing
            cards.forEach(card -> {
                card.setCardNumber(card.getMaskedCardNumber());
                card.setCvv("***");
                card.setPinHash(null);
            });
            
            return ResponseEntity.ok(cards);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get card details by ID (masked)
     * GET /api/credit/cards/{cardId}
     */
    @GetMapping("/cards/{cardId}")
    public ResponseEntity<?> getCard(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this card"));
            }

            // Mask sensitive info for normal viewing
            card.setCardNumber(card.getMaskedCardNumber());
            card.setCvv("***");
            card.setPinHash(null);
            
            return ResponseEntity.ok(card);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * REVEAL full card number (temporary, 30 second view)
     * POST /api/credit/cards/{cardId}/reveal
     */
    @PostMapping("/cards/{cardId}/reveal")
    public ResponseEntity<?> revealCardNumber(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this card"));
            }

            // Check if card is active
            if (!"ACTIVE".equals(card.getStatus()) && !"INACTIVE".equals(card.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Card must be active to view full number"));
            }

            // Create a temporary token or just return the full number
            // In production, you might want to log this action for security
            Map<String, Object> response = new HashMap<>();
            response.put("cardId", card.getId());
            response.put("cardNumber", card.getCardNumber()); // Full unmasked number
            response.put("expiryDate", card.getExpiryDate());
            response.put("cvv", card.getCvv());
            response.put("message", "Card number revealed - will auto-hide after 30 seconds");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Activate card
     * POST /api/credit/cards/{cardId}/activate
     */
    @PostMapping("/cards/{cardId}/activate")
    public ResponseEntity<?> activateCard(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to activate this card"));
            }

            String pin = request.get("pin");
            if (pin == null || pin.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "PIN is required"));
            }

            CreditCard activatedCard = creditCardService.activateCard(cardId, pin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Card activated successfully");
            response.put("cardId", activatedCard.getId());
            response.put("status", activatedCard.getStatus());
            response.put("maskedNumber", activatedCard.getMaskedCardNumber());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Freeze card
     * POST /api/credit/cards/{cardId}/freeze
     */
    @PostMapping("/cards/{cardId}/freeze")
    public ResponseEntity<?> freezeCard(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to freeze this card"));
            }

            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Requested by customer";
            }

            CreditCard frozenCard = creditCardService.freezeCard(cardId, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "Card frozen successfully",
                "status", frozenCard.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unfreeze card
     * POST /api/credit/cards/{cardId}/unfreeze
     */
    @PostMapping("/cards/{cardId}/unfreeze")
    public ResponseEntity<?> unfreezeCard(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to unfreeze this card"));
            }

            CreditCard unfrozenCard = creditCardService.unfreezeCard(cardId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Card unfrozen successfully",
                "status", unfrozenCard.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change PIN
     * POST /api/credit/cards/{cardId}/change-pin
     */
    @PostMapping("/cards/{cardId}/change-pin")
    public ResponseEntity<?> changePin(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to change PIN for this card"));
            }

            String oldPin = request.get("oldPin");
            String newPin = request.get("newPin");
            
            if (oldPin == null || newPin == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Old PIN and new PIN are required"));
            }

            @SuppressWarnings("unused")
            CreditCard updatedCard = creditCardService.changePin(cardId, oldPin, newPin);
            
            return ResponseEntity.ok(Map.of(
                "message", "PIN changed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Make a purchase
     * POST /api/credit/cards/{cardId}/purchase
     */
    @PostMapping("/cards/{cardId}/purchase")
    public ResponseEntity<?> makePurchase(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to use this card"));
            }

            Double amount = null;
            if (request.get("amount") instanceof Integer) {
                amount = ((Integer) request.get("amount")).doubleValue();
            } else if (request.get("amount") instanceof Double) {
                amount = (Double) request.get("amount");
            }

            String merchant = (String) request.get("merchant");

            if (amount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
            }

            if (merchant == null || merchant.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Merchant is required"));
            }

            CreditCard updatedCard = creditCardService.makePurchase(cardId, amount, merchant);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Purchase successful");
            response.put("amount", amount);
            response.put("merchant", merchant);
            response.put("newBalance", updatedCard.getCurrentBalance());
            response.put("availableCredit", updatedCard.getAvailableCredit());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Replace lost/stolen card
     * POST /api/credit/cards/{cardId}/replace
     */
    @PostMapping("/cards/{cardId}/replace")
    public ResponseEntity<?> replaceCard(
            @RequestHeader("sessionId") String sessionId,
            @PathVariable Long cardId,
            @RequestBody Map<String, String> request) {
        try {
            User user = getUserFromSession(sessionId);
            CreditCard card = creditCardService.getCard(cardId);
            
            // Verify card belongs to user
            if (!card.getCreditAccount().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to replace this card"));
            }

            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Replacement reason is required"));
            }

            CreditCard newCard = creditCardService.replaceCard(cardId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Card replaced successfully");
            response.put("newCardId", newCard.getId());
            response.put("newCardNumber", newCard.getMaskedCardNumber());
            response.put("status", newCard.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all cards (admin)
     * GET /api/admin/credit/cards
     */
    @GetMapping("/admin/credit/cards")
    public ResponseEntity<?> getAllCards(@RequestHeader("sessionId") String sessionId) {
        try {
            @SuppressWarnings("unused")
            User admin = getUserFromSession(sessionId);
            // Add admin role check here if needed
            
            List<CreditCard> cards = creditCardService.getAllCards();
            
            // For admin, still mask sensitive info unless they have special permission
            cards.forEach(card -> {
                card.setCardNumber(card.getMaskedCardNumber());
                card.setCvv("***");
                card.setPinHash(null);
            });
            
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get cards expiring soon (admin)
     * GET /api/admin/credit/cards/expiring-soon
     */
    @GetMapping("/admin/credit/cards/expiring-soon")
    public ResponseEntity<?> getCardsExpiringSoon(@RequestHeader("sessionId") String sessionId) {
        try {
            @SuppressWarnings("unused")
            User admin = getUserFromSession(sessionId);
            List<CreditCard> cards = creditCardService.getCardsExpiringSoon();
            
            cards.forEach(card -> {
                card.setCardNumber(card.getMaskedCardNumber());
                card.setCvv("***");
            });
            
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get expired cards (admin)
     * GET /api/admin/credit/cards/expired
     */
    @GetMapping("/admin/credit/cards/expired")
    public ResponseEntity<?> getExpiredCards(@RequestHeader("sessionId") String sessionId) {
        try {
            @SuppressWarnings("unused")
            User admin = getUserFromSession(sessionId);
            List<CreditCard> cards = creditCardService.getExpiredCards();
            
            cards.forEach(card -> {
                card.setCardNumber(card.getMaskedCardNumber());
                card.setCvv("***");
            });
            
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get card statistics (admin)
     * GET /api/admin/credit/cards/statistics
     */
    @GetMapping("/admin/credit/cards/statistics")
    public ResponseEntity<?> getCardStatistics(@RequestHeader("sessionId") String sessionId) {
        try {
            @SuppressWarnings("unused")
            User admin = getUserFromSession(sessionId);
            CreditCardService.CardStatistics stats = creditCardService.getCardStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
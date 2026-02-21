package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.AddCardToWalletRequest;
import com.snopitech.snopitechbank.dto.WalletCardDTO;
import com.snopitech.snopitechbank.dto.WalletDTO;
import com.snopitech.snopitechbank.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletService walletService;

    // ==================== GET ENDPOINTS ====================

    /**
     * GET /api/wallets/user/{userId} - List all wallets for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WalletDTO>> getUserWallets(@PathVariable Long userId) {
        List<WalletDTO> wallets = walletService.getWalletsByUser(userId);
        return ResponseEntity.ok(wallets);
    }

    /**
     * GET /api/wallets/{walletId} - Get wallet details
     */
    @GetMapping("/{walletId}")
    public ResponseEntity<WalletDTO> getWalletById(@PathVariable Long walletId) {
        WalletDTO wallet = walletService.getWalletById(walletId);
        return ResponseEntity.ok(wallet);
    }

    // ==================== CREATE WALLET ====================

    /**
     * POST /api/wallets/create - Create a new wallet
     */
    @PostMapping("/create")
    public ResponseEntity<WalletDTO> createWallet(
            @RequestParam Long userId,
            @RequestParam String walletType,
            @RequestParam String deviceName) {
        
        walletService.getOrCreateWallet(userId, walletType, deviceName);
        List<WalletDTO> wallets = walletService.getWalletsByUser(userId);
        WalletDTO newWallet = wallets.stream()
                .filter(w -> w.getWalletType().equals(walletType))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Wallet creation failed"));
        
        return new ResponseEntity<>(newWallet, HttpStatus.CREATED);
    }

    // ==================== ADD CARD TO WALLET ====================

    /**
     * POST /api/wallets/{walletId}/add-card - Add card to wallet
     */
    @PostMapping("/{walletId}/add-card")
    public ResponseEntity<WalletCardDTO> addCardToWallet(
            @PathVariable Long walletId,
            @Valid @RequestBody AddCardToWalletRequest request) {
        
        WalletCardDTO walletCard = walletService.addCardToWallet(walletId, request);
        return new ResponseEntity<>(walletCard, HttpStatus.CREATED);
    }

    // ==================== REMOVE CARD FROM WALLET ====================

    /**
     * DELETE /api/wallets/{walletId}/remove-card/{cardId} - Remove card from wallet
     */
    @DeleteMapping("/{walletId}/remove-card/{cardId}")
    public ResponseEntity<Map<String, Object>> removeCardFromWallet(
            @PathVariable Long walletId,
            @PathVariable Long cardId) {
        
        walletService.removeCardFromWallet(walletId, cardId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Card removed from wallet successfully");
        response.put("walletId", walletId);
        response.put("cardId", cardId);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    // ==================== WALLET MANAGEMENT ====================

    /**
     * PUT /api/wallets/{walletId}/primary - Set wallet as primary
     */
    @PutMapping("/{walletId}/primary")
    public ResponseEntity<WalletDTO> setPrimaryWallet(
            @PathVariable Long walletId,
            @RequestParam Long userId) {
        
        WalletDTO updatedWallet = walletService.setPrimaryWallet(userId, walletId);
        return ResponseEntity.ok(updatedWallet);
    }

    /**
     * PUT /api/wallets/{walletId}/status - Update wallet status
     */
    @PutMapping("/{walletId}/status")
    public ResponseEntity<WalletDTO> updateWalletStatus(
            @PathVariable Long walletId,
            @RequestParam String status) {
        
        WalletDTO updatedWallet = walletService.updateWalletStatus(walletId, status);
        return ResponseEntity.ok(updatedWallet);
    }

    /**
     * DELETE /api/wallets/{walletId} - Remove/deactivate wallet
     */
    @DeleteMapping("/{walletId}")
    public ResponseEntity<Map<String, Object>> removeWallet(@PathVariable Long walletId) {
        
        walletService.removeWallet(walletId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Wallet deactivated successfully");
        response.put("walletId", walletId);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    // ==================== CONVENIENCE ENDPOINTS ====================

    /**
     * POST /api/wallets/{walletId}/add-card/simplified - Simplified version for common wallets
     */
    @PostMapping("/{walletId}/add-card/simplified")
    public ResponseEntity<WalletCardDTO> addCardSimplified(
            @PathVariable Long walletId,
            @RequestParam Long cardId,
            @RequestParam(required = false) Boolean setAsPrimary) {
        
        AddCardToWalletRequest request = new AddCardToWalletRequest();
        request.setCardId(cardId);
        request.setSetAsPrimary(setAsPrimary != null ? setAsPrimary : false);
        request.setDeviceName("Mobile Device");
        
        WalletCardDTO walletCard = walletService.addCardToWallet(walletId, request);
        return new ResponseEntity<>(walletCard, HttpStatus.CREATED);
    }

    /**
     * GET /api/wallets/types - Get list of supported wallet types
     */
    @GetMapping("/types")
    public ResponseEntity<List<Map<String, String>>> getWalletTypes() {
        List<Map<String, String>> walletTypes = List.of(
            Map.of("type", "APPLE_PAY", "name", "Apple Pay", "icon", "🍎"),
            Map.of("type", "GOOGLE_PAY", "name", "Google Pay", "icon", "📱"),
            Map.of("type", "SAMSUNG_PAY", "name", "Samsung Pay", "icon", "📲"),
            Map.of("type", "PAYPAL", "name", "PayPal", "icon", "💸"),
            Map.of("type", "VENMO", "name", "Venmo", "icon", "💳")
        );
        return ResponseEntity.ok(walletTypes);
    }
}

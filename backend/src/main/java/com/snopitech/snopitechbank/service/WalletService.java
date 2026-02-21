package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.AddCardToWalletRequest;
import com.snopitech.snopitechbank.dto.WalletCardDTO;
import com.snopitech.snopitechbank.dto.WalletDTO;
import com.snopitech.snopitechbank.model.*;
import com.snopitech.snopitechbank.repository.WalletRepository;
import com.snopitech.snopitechbank.repository.WalletCardRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletCardRepository walletCardRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== GET WALLETS ====================

    /**
     * Get all wallets for a user
     */
    public List<WalletDTO> getWalletsByUser(Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        List<WalletDTO> walletDTOs = new ArrayList<>();
        
        for (Wallet wallet : wallets) {
            List<WalletCard> cards = walletCardRepository.findByWalletId(wallet.getId());
            wallet.setWalletCards(cards);
            walletDTOs.add(convertToDTO(wallet));
        }
        
        return walletDTOs;
    }

    /**
     * Get wallet by ID
     */
    public WalletDTO getWalletById(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));
        
        List<WalletCard> cards = walletCardRepository.findByWalletId(walletId);
        wallet.setWalletCards(cards);
        
        return convertToDTO(wallet);
    }

    /**
     * Get or create wallet for a specific wallet type
     */
    @Transactional
    public Wallet getOrCreateWallet(Long userId, String walletType, String deviceName) {
        return walletRepository.findByUserIdAndWalletType(userId, walletType)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    Wallet newWallet = new Wallet(user, walletType, deviceName);
                    return walletRepository.save(newWallet);
                });
    }

    // ==================== ADD CARD TO WALLET ====================

    /**
     * Add a card to a digital wallet
     */
    @Transactional
    public WalletCardDTO addCardToWallet(Long walletId, AddCardToWalletRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));

        Card card = cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + request.getCardId()));

        if (!card.getAccount().getUser().getId().equals(wallet.getUser().getId())) {
            throw new RuntimeException("Card does not belong to this user");
        }

        if (!card.isActive()) {
            throw new RuntimeException("Cannot add inactive card to wallet");
        }

        if (walletCardRepository.existsByWalletIdAndCardId(walletId, card.getId())) {
            throw new RuntimeException("Card already exists in this wallet");
        }

        String tokenizedCardNumber = generateTokenizedCardNumber(card);

        WalletCard walletCard = new WalletCard(wallet, card, tokenizedCardNumber);
        
        walletCard.setWalletCardId(request.getWalletCardId());
        walletCard.setLastUsedDate(LocalDateTime.now());

        wallet.setLastUsedDate(LocalDateTime.now());
        wallet.setDeviceId(request.getDeviceId());
        wallet.setOperatingSystem(request.getOperatingSystem());
        wallet.setOperatingSystemVersion(request.getOperatingSystemVersion());
        wallet.setAppVersion(request.getAppVersion());
        wallet.setBiometricEnabled(request.getEnableBiometrics() != null ? request.getEnableBiometrics() : false);

        if (request.getSetAsPrimary() != null && request.getSetAsPrimary()) {
            walletRepository.findByUserIdAndIsPrimaryTrue(wallet.getUser().getId())
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        walletRepository.save(existingPrimary);
                    });
            wallet.setIsPrimary(true);
        }

        walletRepository.save(wallet);
        WalletCard savedWalletCard = walletCardRepository.save(walletCard);

        return convertToCardDTO(savedWalletCard);
    }

    // ==================== REMOVE CARD FROM WALLET ====================

    /**
     * Remove a card from a digital wallet
     */
    @Transactional
    public void removeCardFromWallet(Long walletId, Long cardId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));

        if (!card.getAccount().getUser().getId().equals(wallet.getUser().getId())) {
            throw new RuntimeException("Card does not belong to this user");
        }

        int updated = walletCardRepository.removeCardFromWallet(walletId, cardId);
        
        if (updated == 0) {
            throw new RuntimeException("Card not found in this wallet");
        }

        wallet.setLastUsedDate(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    // ==================== WALLET MANAGEMENT ====================

    /**
     * Set a wallet as primary
     */
    @Transactional
    public WalletDTO setPrimaryWallet(Long userId, Long walletId) {
        walletRepository.findByUserIdAndIsPrimaryTrue(userId)
                .ifPresent(existingPrimary -> {
                    existingPrimary.setIsPrimary(false);
                    walletRepository.save(existingPrimary);
                });

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));
        
        wallet.setIsPrimary(true);
        wallet.setLastUsedDate(LocalDateTime.now());
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        List<WalletCard> cards = walletCardRepository.findByWalletId(updatedWallet.getId());
        updatedWallet.setWalletCards(cards);
        
        return convertToDTO(updatedWallet);
    }

    /**
     * Update wallet status
     */
    @Transactional
    public WalletDTO updateWalletStatus(Long walletId, String status) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));
        
        wallet.setStatus(status);
        wallet.setLastUsedDate(LocalDateTime.now());
        
        Wallet updatedWallet = walletRepository.save(wallet);
        
        List<WalletCard> cards = walletCardRepository.findByWalletId(updatedWallet.getId());
        updatedWallet.setWalletCards(cards);
        
        return convertToDTO(updatedWallet);
    }

    /**
     * Remove a wallet
     */
    @Transactional
    public void removeWallet(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));
        
        List<WalletCard> walletCards = walletCardRepository.findByWalletId(walletId);
        
        for (WalletCard walletCard : walletCards) {
            walletCard.setStatus("REMOVED");
            walletCardRepository.save(walletCard);
        }
        
        wallet.setStatus("INACTIVE");
        wallet.setLastUsedDate(LocalDateTime.now());
        
        if (wallet.getIsPrimary() != null && wallet.getIsPrimary()) {
            wallet.setIsPrimary(false);
        }
        
        walletRepository.save(wallet);
    }

    // ==================== HELPER METHODS ====================

    private String generateTokenizedCardNumber(Card card) {
        String last4 = card.getCardNumber().substring(card.getCardNumber().length() - 4);
        return "TKN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16) + "_" + last4;
    }

    private WalletDTO convertToDTO(Wallet wallet) {
        List<WalletCardDTO> cardDTOs = new ArrayList<>();
        
        if (wallet.getWalletCards() != null) {
            cardDTOs = wallet.getWalletCards().stream()
                    .filter(wc -> wc != null && "ACTIVE".equals(wc.getStatus()))
                    .map(this::convertToCardDTO)
                    .collect(Collectors.toList());
        }

        return new WalletDTO(
            wallet.getId(),
            wallet.getUser().getId(),
            wallet.getWalletType(),
            wallet.getDeviceName(),
            wallet.getStatus() != null ? wallet.getStatus() : "ACTIVE",
            wallet.getAddedDate(),
            wallet.getLastUsedDate(),
            wallet.getIsPrimary() != null ? wallet.getIsPrimary() : false,
            wallet.getBiometricEnabled() != null ? wallet.getBiometricEnabled() : false,
            cardDTOs.size(),
            cardDTOs
        );
    }

    private WalletCardDTO convertToCardDTO(WalletCard walletCard) {
        if (walletCard == null || walletCard.getCard() == null) {
            return null;
        }
        
        Card card = walletCard.getCard();
        return new WalletCardDTO(
            walletCard.getId(),
            walletCard.getWallet().getId(),
            card.getId(),
            card.getMaskedCardNumber(),
            card.getCardType(),
            card.getCardHolderName(),
            walletCard.getTokenizedCardNumber(),
            walletCard.getAddedDate(),
            walletCard.getLastUsedDate(),
            walletCard.getStatus() != null ? walletCard.getStatus() : "ACTIVE"
        );
    }
}
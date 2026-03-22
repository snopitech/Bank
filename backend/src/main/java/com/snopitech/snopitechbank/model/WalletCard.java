package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_cards")
public class WalletCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(nullable = false)
    private String tokenizedCardNumber; // Device-specific token (not real card number)

    @Column(nullable = false)
    private LocalDateTime addedDate;

    private LocalDateTime lastUsedDate;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, REMOVED

    // For digital wallet specific data
    private String walletCardId; // ID from the wallet provider
    private String fingerprint; // Unique fingerprint from wallet

    // Constructors
    public WalletCard() {
        this.addedDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public WalletCard(Wallet wallet, Card card, String tokenizedCardNumber) {
        this.wallet = wallet;
        this.card = card;
        this.tokenizedCardNumber = tokenizedCardNumber;
        this.addedDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public String getTokenizedCardNumber() {
        return tokenizedCardNumber;
    }

    public void setTokenizedCardNumber(String tokenizedCardNumber) {
        this.tokenizedCardNumber = tokenizedCardNumber;
    }

    public LocalDateTime getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }

    public LocalDateTime getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(LocalDateTime lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWalletCardId() {
        return walletCardId;
    }

    public void setWalletCardId(String walletCardId) {
        this.walletCardId = walletCardId;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }

    // Helper method to get masked card number
    public String getMaskedCardNumber() {
        if (card != null && card.getCardNumber() != null) {
            return "****" + card.getCardNumber().substring(card.getCardNumber().length() - 4);
        }
        return "****";
    }
}

package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.WalletCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletCardRepository extends JpaRepository<WalletCard, Long> {

    // Find all cards in a specific wallet
    List<WalletCard> findByWalletId(Long walletId);

    // Find active cards in a wallet
    List<WalletCard> findByWalletIdAndStatus(Long walletId, String status);

    // Find if a specific card is in any wallet
    List<WalletCard> findByCardId(Long cardId);

    // Find wallet card by token
    Optional<WalletCard> findByTokenizedCardNumber(String tokenizedCardNumber);

    // Find wallet card by wallet provider's ID
    Optional<WalletCard> findByWalletCardId(String walletCardId);

    // Check if a card is already added to a specific wallet
    boolean existsByWalletIdAndCardId(Long walletId, Long cardId);

    // Count cards in a wallet
    long countByWalletId(Long walletId);

    // Remove a card from a wallet (soft delete by status update)
    @Modifying
    @Transactional
    @Query("UPDATE WalletCard wc SET wc.status = 'REMOVED' WHERE wc.wallet.id = :walletId AND wc.card.id = :cardId")
    int removeCardFromWallet(@Param("walletId") Long walletId, @Param("cardId") Long cardId);

    // Find all wallets that contain a specific card
    @Query("SELECT wc.wallet.id FROM WalletCard wc WHERE wc.card.id = :cardId AND wc.status = 'ACTIVE'")
    List<Long> findWalletIdsByCardId(@Param("cardId") Long cardId);

    // Get card usage statistics
    @Query("SELECT COUNT(wc) FROM WalletCard wc WHERE wc.card.id = :cardId AND wc.status = 'ACTIVE'")
    long countActiveWalletsForCard(@Param("cardId") Long cardId);

    // Find recently used wallet cards
    List<WalletCard> findByLastUsedDateAfterOrderByLastUsedDateDesc(LocalDateTime date);

    // Find wallet card by wallet and card
    Optional<WalletCard> findByWalletIdAndCardId(Long walletId, Long cardId);
}
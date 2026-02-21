package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserId(Long userId);

    List<Wallet> findByWalletType(String walletType);

    List<Wallet> findByUserIdAndStatus(Long userId, String status);

    Optional<Wallet> findByUserIdAndIsPrimaryTrue(Long userId);

    Optional<Wallet> findByDeviceId(String deviceId);

    List<Wallet> findByBiometricEnabledTrue();

    long countByUserId(Long userId);

    boolean existsByUserIdAndWalletType(Long userId, String walletType);

    Optional<Wallet> findByUserIdAndWalletType(Long userId, String walletType);

    @Query("SELECT w FROM Wallet w LEFT JOIN FETCH w.walletCards WHERE w.id = :id")
    Optional<Wallet> findByIdWithCards(@Param("id") Long id);

    @Query("SELECT w FROM Wallet w WHERE w.lastUsedDate < :date OR w.lastUsedDate IS NULL")
    List<Wallet> findInactiveWallets(@Param("date") LocalDateTime date);
}
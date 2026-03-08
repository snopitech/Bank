package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.VerificationCode;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    List<VerificationCode> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<VerificationCode> findTopByUserAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
        User user, LocalDateTime now);
    
    void deleteByUser(User user);
    
    void deleteByExpiresAtBefore(LocalDateTime expiry);
}
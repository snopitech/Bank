package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.StopPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StopPaymentRepository extends JpaRepository<StopPayment, Long> {

    // Find all stop payments for an account
    List<StopPayment> findByAccountId(Long accountId);

    // Find active stop payments for an account
    List<StopPayment> findByAccountIdAndStatus(Long accountId, String status);

    

    // Find stop payment by check number
    Optional<StopPayment> findByAccountIdAndCheckNumber(Long accountId, String checkNumber);

    // Find expired stop payments (for batch processing)
    @Query("SELECT s FROM StopPayment s WHERE s.expirationDate < :date AND s.status = 'ACTIVE'")
    List<StopPayment> findExpiredStopPayments(@Param("date") LocalDate date);

    // Update status to EXPIRED for expired stop payments
    @Modifying
    @Transactional
    @Query("UPDATE StopPayment s SET s.status = 'EXPIRED', s.updatedAt = CURRENT_TIMESTAMP WHERE s.expirationDate < :date AND s.status = 'ACTIVE'")
    int expireOldStopPayments(@Param("date") LocalDate date);

    // Release/Cancel a stop payment
    @Modifying
    @Transactional
    @Query("UPDATE StopPayment s SET s.status = 'RELEASED', s.updatedAt = CURRENT_TIMESTAMP WHERE s.id = :id AND s.status = 'ACTIVE'")
    int releaseStopPayment(@Param("id") Long id);

    // Check if a check has an active stop payment
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM StopPayment s WHERE s.accountId = :accountId AND s.checkNumber = :checkNumber AND s.status = 'ACTIVE'")
    boolean hasActiveStopPayment(@Param("accountId") Long accountId, @Param("checkNumber") String checkNumber);

    // Get count of active stop payments for an account
    @Query("SELECT COUNT(s) FROM StopPayment s WHERE s.accountId = :accountId AND s.status = 'ACTIVE'")
    long countActiveStopPayments(@Param("accountId") Long accountId);
}
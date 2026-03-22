package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Employee;
import com.snopitech.snopitechbank.model.HRVerificationCode;
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
public interface HRVerificationCodeRepository extends JpaRepository<HRVerificationCode, Long> {

    // Find the most recent unused, unexpired code for an employee
    Optional<HRVerificationCode> findTopByEmployeeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
        Employee employee, LocalDateTime now);

    // Find all codes for an employee ordered by creation date
    List<HRVerificationCode> findByEmployeeOrderByCreatedAtDesc(Employee employee);

    // Find code by employee and code value
    Optional<HRVerificationCode> findByEmployeeAndCodeAndUsedFalse(Employee employee, String code);

    // Delete all expired codes
    @Modifying
    @Transactional
    @Query("DELETE FROM HRVerificationCode v WHERE v.expiresAt < :now")
    void deleteAllExpiredCodes(@Param("now") LocalDateTime now);

    // Delete all codes for a specific employee
    @Modifying
    @Transactional
    void deleteByEmployee(Employee employee);

    // Count failed attempts in last 30 minutes (for rate limiting)
    @Query("SELECT COUNT(v) FROM HRVerificationCode v WHERE v.employee = :employee AND v.createdAt > :since")
    long countRecentAttempts(@Param("employee") Employee employee, @Param("since") LocalDateTime since);
}
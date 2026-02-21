package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.RecurringPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecurringPaymentRepository extends JpaRepository<RecurringPayment, Long> {
    
    // Find all recurring payments for a specific account
    List<RecurringPayment> findByAccountId(Long accountId);
    
    // Find active recurring payments for an account
    List<RecurringPayment> findByAccountIdAndActiveTrue(Long accountId);
    
    // Find by status
    List<RecurringPayment> findByStatus(String status);
    
    // Find by category
    List<RecurringPayment> findByCategory(String category);
    
    // Find upcoming payments (next payment date between now and a future date)
    List<RecurringPayment> findByNextPaymentDateBetween(LocalDateTime start, LocalDateTime end);
    
    // Find payments due today
    @Query("SELECT r FROM RecurringPayment r WHERE DATE(r.nextPaymentDate) = CURRENT_DATE AND r.active = true")
    List<RecurringPayment> findPaymentsDueToday();
    
    // Find by payee name (for searching)
    List<RecurringPayment> findByPayeeNameContainingIgnoreCase(String payeeName);
    
    // Check if account has any recurring payments
    boolean existsByAccountId(Long accountId);
    
    // Find by frequency
    List<RecurringPayment> findByFrequency(String frequency);
}
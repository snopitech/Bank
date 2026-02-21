package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.CreateRecurringPaymentRequest;
import com.snopitech.snopitechbank.dto.RecurringPaymentDTO;
import com.snopitech.snopitechbank.dto.UpdateRecurringPaymentRequest;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.RecurringPayment;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.RecurringPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecurringPaymentService {

    @Autowired
    private RecurringPaymentRepository recurringPaymentRepository;

    @Autowired
    private AccountRepository accountRepository;

    // List all recurring payments for an account
    public List<RecurringPaymentDTO> getRecurringPaymentsByAccount(Long accountId) {
        List<RecurringPayment> payments = recurringPaymentRepository.findByAccountId(accountId);
        return payments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get specific recurring payment by ID
    public RecurringPaymentDTO getRecurringPaymentById(Long id) {
        RecurringPayment payment = recurringPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring payment not found with id: " + id));
        return convertToDTO(payment);
    }

    // Create new recurring payment
    @Transactional
    public RecurringPaymentDTO createRecurringPayment(Long accountId, CreateRecurringPaymentRequest request) {
        // Verify account exists
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        // Check if account is closed (null-safe check)
        if (Boolean.TRUE.equals(account.isClosed())) {
            throw new RuntimeException("Cannot create recurring payment on a closed account");
        }

        // Check if account has sufficient balance for first payment (optional validation)
        if (account.getBalance() < request.getAmount()) {
            throw new RuntimeException("Insufficient funds for recurring payment setup");
        }

        // Create new recurring payment
        RecurringPayment payment = new RecurringPayment();
        payment.setAccount(account);
        payment.setPayeeName(request.getPayeeName());
        payment.setPayeeAccountNumber(request.getPayeeAccountNumber());
        payment.setPayeeRoutingNumber(request.getPayeeRoutingNumber());
        payment.setAmount(request.getAmount());
        payment.setFrequency(request.getFrequency());
        payment.setPaymentDay(request.getPaymentDay());
        payment.setStartDate(request.getStartDate());
        payment.setEndDate(request.getEndDate());
        payment.setCategory(request.getCategory());
        payment.setDescription(request.getDescription());
        
        // Calculate next payment date
        payment.setNextPaymentDate(calculateNextPaymentDate(request));

        RecurringPayment savedPayment = recurringPaymentRepository.save(payment);
        return convertToDTO(savedPayment);
    }

    // Update recurring payment
    @Transactional
    public RecurringPaymentDTO updateRecurringPayment(Long id, UpdateRecurringPaymentRequest request) {
        RecurringPayment payment = recurringPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring payment not found with id: " + id));

        // Check if account is closed (null-safe check)
        if (Boolean.TRUE.equals(payment.getAccount().isClosed())) {
            throw new RuntimeException("Cannot update recurring payment on a closed account");
        }

        // Update fields if provided
        if (request.getPayeeName() != null) {
            payment.setPayeeName(request.getPayeeName());
        }
        if (request.getPayeeAccountNumber() != null) {
            payment.setPayeeAccountNumber(request.getPayeeAccountNumber());
        }
        if (request.getPayeeRoutingNumber() != null) {
            payment.setPayeeRoutingNumber(request.getPayeeRoutingNumber());
        }
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        if (request.getFrequency() != null) {
            payment.setFrequency(request.getFrequency());
        }
        if (request.getPaymentDay() != null) {
            payment.setPaymentDay(request.getPaymentDay());
        }
        if (request.getStartDate() != null) {
            payment.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            payment.setEndDate(request.getEndDate());
        }
        if (request.getCategory() != null) {
            payment.setCategory(request.getCategory());
        }
        if (request.getDescription() != null) {
            payment.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }
        if (request.getActive() != null) {
            payment.setActive(request.getActive());
        }

        // Recalculate next payment date if relevant fields changed
        if (request.getFrequency() != null || request.getPaymentDay() != null || 
            request.getStartDate() != null) {
            payment.setNextPaymentDate(calculateNextPaymentDate(payment));
        }

        payment.setUpdatedAt(LocalDateTime.now());

        RecurringPayment updatedPayment = recurringPaymentRepository.save(payment);
        return convertToDTO(updatedPayment);
    }

    // Delete/cancel recurring payment
    @Transactional
    public void deleteRecurringPayment(Long id) {
        RecurringPayment payment = recurringPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring payment not found with id: " + id));
        
        // Soft delete by setting active to false and status to CANCELLED
        payment.setActive(false);
        payment.setStatus("CANCELLED");
        payment.setUpdatedAt(LocalDateTime.now());
        recurringPaymentRepository.save(payment);
    }

    // Helper method to calculate next payment date from request
    private LocalDateTime calculateNextPaymentDate(CreateRecurringPaymentRequest request) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = request.getStartDate();
        
        // If start date is in the future, use that
        if (startDate != null && startDate.isAfter(now)) {
            return startDate;
        }
        
        // Otherwise calculate based on frequency and payment day
        return calculateNextDateFromFrequency(now, request.getFrequency(), request.getPaymentDay());
    }

    // Helper method to calculate next payment date from existing payment
    private LocalDateTime calculateNextPaymentDate(RecurringPayment payment) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = payment.getStartDate();
        
        // If start date is in the future, use that
        if (startDate != null && startDate.isAfter(now)) {
            return startDate;
        }
        
        // Otherwise calculate based on frequency and payment day
        return calculateNextDateFromFrequency(now, payment.getFrequency(), payment.getPaymentDay());
    }

    // Helper method to calculate next date based on frequency
    private LocalDateTime calculateNextDateFromFrequency(LocalDateTime from, String frequency, Integer paymentDay) {
        switch (frequency) {
            case "WEEKLY":
                // paymentDay 0-6 represents day of week (0=Sunday)
                int currentDayOfWeek = from.getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday=0)
                int daysToAdd = (paymentDay - currentDayOfWeek + 7) % 7;
                if (daysToAdd == 0) daysToAdd = 7; // If today, schedule for next week
                return from.plusDays(daysToAdd);
                
            case "BIWEEKLY":
                // Simple: add 14 days from now
                return from.plusWeeks(2);
                
            case "MONTHLY":
                // Set to specific day of month (1-31)
                int targetDay = Math.min(paymentDay, from.getMonth().length(from.toLocalDate().isLeapYear()));
                LocalDateTime nextDate = from.withDayOfMonth(targetDay);
                if (nextDate.isBefore(from) || nextDate.isEqual(from)) {
                    nextDate = nextDate.plusMonths(1);
                }
                return nextDate;
                
            case "QUARTERLY":
                return from.plusMonths(3);
                
            case "YEARLY":
                return from.plusYears(1);
                
            default:
                return from.plusMonths(1);
        }
    }

    // Helper method to convert entity to DTO
    private RecurringPaymentDTO convertToDTO(RecurringPayment payment) {
        return new RecurringPaymentDTO(
            payment.getId(),
            payment.getAccount().getId(),
            payment.getPayeeName(),
            payment.getPayeeAccountNumber(),
            payment.getPayeeRoutingNumber(),
            payment.getAmount(),
            payment.getFrequency(),
            payment.getPaymentDay(),
            payment.getStartDate(),
            payment.getEndDate(),
            payment.getNextPaymentDate(),
            payment.getLastPaymentDate(),
            payment.getActive(),
            payment.getStatus(),
            payment.getCategory(),
            payment.getDescription(),
            payment.getCreatedAt()
        );
    }
}
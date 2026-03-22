package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.StopPayment;
import com.snopitech.snopitechbank.repository.StopPaymentRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class StopPaymentServiceImpl implements StopPaymentService {

    @Autowired
    private StopPaymentRepository stopPaymentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public List<StopPayment> getStopPayments(Long accountId) {
        // Verify account exists
        accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return stopPaymentRepository.findByAccountId(accountId);
    }

    @Override
    public List<StopPayment> getActiveStopPayments(Long accountId) {
        // Verify account exists
        accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return stopPaymentRepository.findByAccountIdAndStatus(accountId, "ACTIVE");
    }

    @Override
    public StopPayment placeStopPayment(Long accountId, String checkNumber, String payeeName,
                                         Double amount, LocalDate checkDate, String reason) {
        // Verify account exists
        accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Check if there's already an active stop payment for this check
        if (stopPaymentRepository.hasActiveStopPayment(accountId, checkNumber)) {
            throw new RuntimeException("An active stop payment already exists for check #" + checkNumber);
        }
        
        // Create new stop payment using your constructor
        StopPayment stopPayment = new StopPayment(accountId, checkNumber, reason);
        
        // Set optional fields
        if (payeeName != null && !payeeName.trim().isEmpty()) {
            stopPayment.setPayeeName(payeeName);
        }
        
        if (amount != null && amount > 0) {
            stopPayment.setAmount(amount);
        }
        
        if (checkDate != null) {
            stopPayment.setCheckDate(checkDate);
        }
        
        // Set default fee
        stopPayment.setFeeCharged(35.00);
        
        return stopPaymentRepository.save(stopPayment);
    }

    @Override
    @Transactional
    public void removeStopPayment(Long stopPaymentId) {
        @SuppressWarnings("unused")
        StopPayment stopPayment = stopPaymentRepository.findById(stopPaymentId)
                .orElseThrow(() -> new RuntimeException("Stop payment not found with id: " + stopPaymentId));
        
        // Use the repository's release method
        int updated = stopPaymentRepository.releaseStopPayment(stopPaymentId);
        
        if (updated == 0) {
            throw new RuntimeException("Failed to release stop payment - it may not be active");
        }
    }

    @Override
    public boolean hasActiveStopPayment(Long accountId, String checkNumber) {
        return stopPaymentRepository.hasActiveStopPayment(accountId, checkNumber);
    }

    @Override
    public StopPayment getStopPaymentById(Long stopPaymentId) {
        return stopPaymentRepository.findById(stopPaymentId)
                .orElseThrow(() -> new RuntimeException("Stop payment not found with id: " + stopPaymentId));
    }

    // Optional: Method to expire old stop payments
    @Transactional
    public int expireOldStopPayments() {
        return stopPaymentRepository.expireOldStopPayments(LocalDate.now());
    }
}
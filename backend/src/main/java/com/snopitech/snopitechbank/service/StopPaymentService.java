package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.StopPayment;
import java.time.LocalDate;
import java.util.List;

public interface StopPaymentService {

    // Get all stop payments for an account
    List<StopPayment> getStopPayments(Long accountId);

    // Get active stop payments for an account
    List<StopPayment> getActiveStopPayments(Long accountId);

    // Place a new stop payment
    StopPayment placeStopPayment(Long accountId, String checkNumber, String payeeName,
                                  Double amount, LocalDate checkDate, String reason);

    // Remove/release a stop payment
    void removeStopPayment(Long stopPaymentId);

    // Check if a check has an active stop payment
    boolean hasActiveStopPayment(Long accountId, String checkNumber);

    // Get stop payment by ID
    StopPayment getStopPaymentById(Long stopPaymentId);
}
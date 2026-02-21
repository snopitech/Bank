package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.CreateRecurringPaymentRequest;
import com.snopitech.snopitechbank.dto.RecurringPaymentDTO;
import com.snopitech.snopitechbank.dto.UpdateRecurringPaymentRequest;
import com.snopitech.snopitechbank.service.RecurringPaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/{accountId}/recurring")
public class RecurringPaymentController {

    @Autowired
    private RecurringPaymentService recurringPaymentService;

    // GET /api/accounts/{accountId}/recurring - List recurring payments
    @GetMapping
    public ResponseEntity<List<RecurringPaymentDTO>> getRecurringPayments(@PathVariable Long accountId) {
        List<RecurringPaymentDTO> payments = recurringPaymentService.getRecurringPaymentsByAccount(accountId);
        return ResponseEntity.ok(payments);
    }

    // GET /api/accounts/{accountId}/recurring/{id} - Get specific recurring payment
    @GetMapping("/{id}")
    public ResponseEntity<RecurringPaymentDTO> getRecurringPaymentById(
            @PathVariable Long accountId,
            @PathVariable Long id) {
        RecurringPaymentDTO payment = recurringPaymentService.getRecurringPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    // POST /api/accounts/{accountId}/recurring - Create recurring payment
    @PostMapping
    public ResponseEntity<RecurringPaymentDTO> createRecurringPayment(
            @PathVariable Long accountId,
            @Valid @RequestBody CreateRecurringPaymentRequest request) {
        RecurringPaymentDTO createdPayment = recurringPaymentService.createRecurringPayment(accountId, request);
        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
    }

    // PUT /api/accounts/{accountId}/recurring/{id} - Update recurring payment
    @PutMapping("/{id}")
    public ResponseEntity<RecurringPaymentDTO> updateRecurringPayment(
            @PathVariable Long accountId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecurringPaymentRequest request) {
        RecurringPaymentDTO updatedPayment = recurringPaymentService.updateRecurringPayment(id, request);
        return ResponseEntity.ok(updatedPayment);
    }

    // DELETE /api/accounts/{accountId}/recurring/{id} - Cancel recurring payment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringPayment(
            @PathVariable Long accountId,
            @PathVariable Long id) {
        recurringPaymentService.deleteRecurringPayment(id);
        return ResponseEntity.noContent().build();
    }

    // Additional useful endpoints
    
    // PATCH /api/accounts/{accountId}/recurring/{id}/pause - Pause recurring payment
    @PatchMapping("/{id}/pause")
    public ResponseEntity<RecurringPaymentDTO> pauseRecurringPayment(
            @PathVariable Long accountId,
            @PathVariable Long id) {
        UpdateRecurringPaymentRequest request = new UpdateRecurringPaymentRequest();
        request.setStatus("PAUSED");
        request.setActive(false);
        RecurringPaymentDTO updatedPayment = recurringPaymentService.updateRecurringPayment(id, request);
        return ResponseEntity.ok(updatedPayment);
    }

    // PATCH /api/accounts/{accountId}/recurring/{id}/resume - Resume recurring payment
    @PatchMapping("/{id}/resume")
    public ResponseEntity<RecurringPaymentDTO> resumeRecurringPayment(
            @PathVariable Long accountId,
            @PathVariable Long id) {
        UpdateRecurringPaymentRequest request = new UpdateRecurringPaymentRequest();
        request.setStatus("ACTIVE");
        request.setActive(true);
        RecurringPaymentDTO updatedPayment = recurringPaymentService.updateRecurringPayment(id, request);
        return ResponseEntity.ok(updatedPayment);
    }
}
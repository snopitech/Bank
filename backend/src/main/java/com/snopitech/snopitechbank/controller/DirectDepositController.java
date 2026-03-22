package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.CreateDirectDepositRequest;
import com.snopitech.snopitechbank.dto.DirectDepositDTO;
import com.snopitech.snopitechbank.service.DirectDepositService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/{accountId}/direct-deposit")
public class DirectDepositController {

    @Autowired
    private DirectDepositService directDepositService;

    // GET /api/accounts/{accountId}/direct-deposit - Get direct deposit info
    @GetMapping
    public ResponseEntity<List<DirectDepositDTO>> getDirectDeposits(@PathVariable Long accountId) {
        List<DirectDepositDTO> directDeposits = directDepositService.getDirectDepositsByAccount(accountId);
        return ResponseEntity.ok(directDeposits);
    }

    // GET /api/accounts/{accountId}/direct-deposit/{id} - Get specific direct deposit
    @GetMapping("/{id}")
    public ResponseEntity<DirectDepositDTO> getDirectDepositById(@PathVariable Long accountId, @PathVariable Long id) {
        DirectDepositDTO directDeposit = directDepositService.getDirectDepositById(id);
        return ResponseEntity.ok(directDeposit);
    }

    // POST /api/accounts/{accountId}/direct-deposit - Set up direct deposit
    @PostMapping
    public ResponseEntity<DirectDepositDTO> createDirectDeposit(
            @PathVariable Long accountId,
            @Valid @RequestBody CreateDirectDepositRequest request) {
        DirectDepositDTO createdDeposit = directDepositService.createDirectDeposit(accountId, request);
        return new ResponseEntity<>(createdDeposit, HttpStatus.CREATED);
    }

    // PUT /api/accounts/{accountId}/direct-deposit/{id} - Update direct deposit
    @PutMapping("/{id}")
    public ResponseEntity<DirectDepositDTO> updateDirectDeposit(
            @PathVariable Long accountId,
            @PathVariable Long id,
            @Valid @RequestBody CreateDirectDepositRequest request) {
        DirectDepositDTO updatedDeposit = directDepositService.updateDirectDeposit(id, request);
        return ResponseEntity.ok(updatedDeposit);
    }

    // DELETE /api/accounts/{accountId}/direct-deposit/{id} - Delete/cancel direct deposit
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDirectDeposit(
            @PathVariable Long accountId,
            @PathVariable Long id) {
        directDepositService.deleteDirectDeposit(id);
        return ResponseEntity.noContent().build();
    }
}

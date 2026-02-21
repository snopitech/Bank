package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.CreateDirectDepositRequest;
import com.snopitech.snopitechbank.dto.DirectDepositDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.DirectDeposit;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.DirectDepositRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DirectDepositService {

    @Autowired
    private DirectDepositRepository directDepositRepository;

    @Autowired
    private AccountRepository accountRepository;

    // Get direct deposit info for an account
    public List<DirectDepositDTO> getDirectDepositsByAccount(Long accountId) {
        List<DirectDeposit> directDeposits = directDepositRepository.findByAccountId(accountId);
        return directDeposits.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get specific direct deposit by ID
    public DirectDepositDTO getDirectDepositById(Long id) {
        DirectDeposit directDeposit = directDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Direct deposit not found with id: " + id));
        return convertToDTO(directDeposit);
    }

    // Set up new direct deposit
    @Transactional
    public DirectDepositDTO createDirectDeposit(Long accountId, CreateDirectDepositRequest request) {
        // Verify account exists
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        // Check if account is closed (null-safe check)
        if (Boolean.TRUE.equals(account.isClosed())) {
            throw new RuntimeException("Cannot set up direct deposit on a closed account");
        }

        // If this is primary deposit, unset any existing primary deposits
        if (request.getIsPrimaryDeposit()) {
            directDepositRepository.findByAccountIdAndIsPrimaryDepositTrue(accountId)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimaryDeposit(false);
                        directDepositRepository.save(existingPrimary);
                    });
        }

        // Create new direct deposit
        DirectDeposit directDeposit = new DirectDeposit();
        directDeposit.setAccount(account);
        directDeposit.setEmployerName(request.getEmployerName());
        directDeposit.setEmployerRoutingNumber(request.getEmployerRoutingNumber());
        directDeposit.setEmployerAccountNumber(request.getEmployerAccountNumber());
        directDeposit.setDepositAmount(request.getDepositAmount());
        directDeposit.setFrequency(request.getFrequency());
        directDeposit.setIsPrimaryDeposit(request.getIsPrimaryDeposit());
        directDeposit.setDepositType(request.getDepositType());
        
        // Calculate next deposit date based on frequency
        directDeposit.setNextDepositDate(calculateNextDepositDate(request.getFrequency()));

        DirectDeposit savedDeposit = directDepositRepository.save(directDeposit);
        return convertToDTO(savedDeposit);
    }

    // Update direct deposit
    @Transactional
    public DirectDepositDTO updateDirectDeposit(Long id, CreateDirectDepositRequest request) {
        DirectDeposit directDeposit = directDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Direct deposit not found with id: " + id));

        // Check if account is closed (null-safe check)
        if (Boolean.TRUE.equals(directDeposit.getAccount().isClosed())) {
            throw new RuntimeException("Cannot update direct deposit on a closed account");
        }

        // Update fields
        if (request.getEmployerName() != null) {
            directDeposit.setEmployerName(request.getEmployerName());
        }
        if (request.getEmployerRoutingNumber() != null) {
            directDeposit.setEmployerRoutingNumber(request.getEmployerRoutingNumber());
        }
        if (request.getEmployerAccountNumber() != null) {
            directDeposit.setEmployerAccountNumber(request.getEmployerAccountNumber());
        }
        if (request.getDepositAmount() != null) {
            directDeposit.setDepositAmount(request.getDepositAmount());
        }
        if (request.getFrequency() != null) {
            directDeposit.setFrequency(request.getFrequency());
            // Recalculate next deposit date if frequency changed
            directDeposit.setNextDepositDate(calculateNextDepositDate(request.getFrequency()));
        }
        if (request.getIsPrimaryDeposit() != null && request.getIsPrimaryDeposit()) {
            // Unset any other primary deposits
            directDepositRepository.findByAccountIdAndIsPrimaryDepositTrue(
                    directDeposit.getAccount().getId())
                    .ifPresent(existingPrimary -> {
                        if (!existingPrimary.getId().equals(id)) {
                            existingPrimary.setIsPrimaryDeposit(false);
                            directDepositRepository.save(existingPrimary);
                        }
                    });
            directDeposit.setIsPrimaryDeposit(true);
        }
        if (request.getDepositType() != null) {
            directDeposit.setDepositType(request.getDepositType());
        }

        DirectDeposit updatedDeposit = directDepositRepository.save(directDeposit);
        return convertToDTO(updatedDeposit);
    }

    // Delete/cancel direct deposit
    @Transactional
    public void deleteDirectDeposit(Long id) {
        DirectDeposit directDeposit = directDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Direct deposit not found with id: " + id));
        
        // Soft delete by setting active to false
        directDeposit.setActive(false);
        directDeposit.setStatus("CANCELLED");
        directDepositRepository.save(directDeposit);
    }

    // Helper method to convert entity to DTO
    private DirectDepositDTO convertToDTO(DirectDeposit directDeposit) {
        return new DirectDepositDTO(
            directDeposit.getId(),
            directDeposit.getAccount().getId(),
            directDeposit.getEmployerName(),
            directDeposit.getEmployerRoutingNumber(),
            directDeposit.getEmployerAccountNumber(),
            directDeposit.getDepositAmount(),
            directDeposit.getFrequency(),
            directDeposit.getSetupDate(),
            directDeposit.getLastDepositDate(),
            directDeposit.getNextDepositDate(),
            directDeposit.getActive(),
            directDeposit.getIsPrimaryDeposit(),
            directDeposit.getDepositType(),
            directDeposit.getStatus()
        );
    }

    // Helper method to calculate next deposit date based on frequency
    private LocalDateTime calculateNextDepositDate(String frequency) {
        LocalDateTime now = LocalDateTime.now();
        switch (frequency) {
            case "WEEKLY":
                return now.plusWeeks(1);
            case "BIWEEKLY":
                return now.plusWeeks(2);
            case "MONTHLY":
                return now.plusMonths(1);
            case "SEMI_MONTHLY":
                return now.plusDays(15);
            default:
                return now.plusMonths(1);
        }
    }
}
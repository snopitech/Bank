package com.snopitech.snopitechbank.mapper;

import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Transaction;

public class TransactionMapper {

    // ENTITY → DTO
    public static TransactionDTO toDTO(Transaction tx) {
        TransactionDTO dto = new TransactionDTO();

        dto.setId(tx.getId());
        dto.setAccountId(tx.getAccountId());
        dto.setType(tx.getType());
        dto.setAmount(tx.getAmount());
        dto.setTimestamp(tx.getTimestamp());
        dto.setDescription(tx.getDescription());
        dto.setTargetAccountId(tx.getTargetAccountId());
        dto.setBalanceAfter(tx.getBalanceAfter());

        // ⭐ NEW: map category
        dto.setCategory(tx.getCategory());

        return dto;
    }

    // DTO → ENTITY (used only if needed)
    public static Transaction toEntity(TransactionDTO dto) {
        Transaction tx = new Transaction();

        tx.setId(dto.getId());
        tx.setAccountId(dto.getAccountId());
        tx.setAmount(dto.getAmount());
        tx.setType(dto.getType());
        tx.setTimestamp(dto.getTimestamp());
        tx.setDescription(dto.getDescription());
        tx.setTargetAccountId(dto.getTargetAccountId());

        // ⭐ NEW: map category
        tx.setCategory(dto.getCategory());

        // balanceAfter is set in the service layer
        tx.setBalanceAfter(0);

        return tx;
    }
}

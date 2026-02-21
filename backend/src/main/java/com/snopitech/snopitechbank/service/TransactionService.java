package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.dto.TransactionDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TransactionService {

    TransactionDTO createTransaction(TransactionDTO dto);

    List<TransactionDTO> getAllTransactions();

    List<TransactionDTO> getTransactionsByAccountId(Long accountId);

    TransactionDTO getTransactionById(Long id);

    List<TransactionDTO> getTransactionsForAccount(Long accountId);

    Page<TransactionDTO> filterTransactions(
            String type,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String sort,
            int page,
            int size
    );

    Page<TransactionDTO> filterTransactionsByAccount(
            Long accountId,
            String type,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String sort,
            int page,
            int size
    );

    void clearAllTransactions();

    // Monthly statement helpers
    double calculateOpeningBalance(Long accountId, int year, int month);

    double calculateClosingBalance(Long accountId, int year, int month);

    double sumDeposits(Long accountId, int year, int month);

    double sumWithdrawals(Long accountId, int year, int month);

    double sumTransfersIn(Long accountId, int year, int month);

    double sumTransfersOut(Long accountId, int year, int month);

    List<TransactionDTO> filterTransactionsByMonth(List<TransactionDTO> transactions, int year, int month);

    // Full monthly statement
    MonthlyStatementDTO getMonthlyStatement(Long accountId, int year, int month);
    
    // ⭐ NEW - Clear transactions for a specific account by account ID
    void clearTransactionsByAccountId(Long accountId);
    
    // ⭐ NEW - Get all transactions for all accounts belonging to a user
    List<TransactionDTO> getTransactionsByUserId(Long userId);
}
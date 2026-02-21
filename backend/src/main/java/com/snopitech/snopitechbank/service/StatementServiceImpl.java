package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Statement;
import com.snopitech.snopitechbank.model.Transaction;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.StatementRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatementServiceImpl implements StatementService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private StatementRepository statementRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public MonthlyStatementDTO getMonthlyStatement(Long accountId, int year, int month) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        MonthlyStatementDTO dto = new MonthlyStatementDTO();
        dto.setAccountId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setAccountHolderName(account.getOwnerName());
        dto.setYear(year);
        dto.setMonth(month);

        // Get transactions for the month
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusNanos(1);
        
        List<Transaction> monthlyTransactions = transactionRepository
            .findTransactionsByDateRange(accountId, startDate, endDate);
        
        // Calculate totals
        double totalDeposits = monthlyTransactions.stream()
            .filter(t -> "DEPOSIT".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
            
        double totalWithdrawals = monthlyTransactions.stream()
            .filter(t -> "WITHDRAWAL".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
            
        double totalTransfersIn = monthlyTransactions.stream()
            .filter(t -> "TRANSFER_IN".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
            
        double totalTransfersOut = monthlyTransactions.stream()
            .filter(t -> "TRANSFER_OUT".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
        
        // Get opening balance (balance at start of month)
        Transaction firstTransaction = monthlyTransactions.stream()
            .findFirst().orElse(null);
        double openingBalance = firstTransaction != null ? 
            firstTransaction.getBalanceAfter() - firstTransaction.getAmount() : 
            account.getBalance();

        dto.setOpeningBalance(openingBalance);
        dto.setClosingBalance(account.getBalance());
        dto.setTotalDeposits(totalDeposits);
        dto.setTotalWithdrawals(totalWithdrawals);
        dto.setTotalTransfersIn(totalTransfersIn);
        dto.setTotalTransfersOut(totalTransfersOut);
        
        // Convert Transaction to TransactionDTO
        List<TransactionDTO> transactionDTOs = monthlyTransactions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        dto.setTransactions(transactionDTOs);

        return dto;
    }

    @Override
    public byte[] exportStatementPdf(Long accountId, int year, int month) {
        // Get the statement data
        MonthlyStatementDTO statement = getMonthlyStatement(accountId, year, month);
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // This would generate a PDF
        // For now, return a placeholder
        String content = String.format(
            "Statement for Account: %s\nYear: %d, Month: %d\nOpening Balance: %.2f\nClosing Balance: %.2f",
            account.getAccountNumber(), year, month, statement.getOpeningBalance(), statement.getClosingBalance()
        );
        
        return content.getBytes();
    }

    @Override
    public List<Statement> getAccountStatements(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return statementRepository.findByAccountOrderByYearDescMonthDesc(account);
    }

    @Override
    public List<Statement> getStatementsByYear(Long accountId, int year) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return statementRepository.findByAccountAndYearOrderByMonthDesc(account, year);
    }

    @Override
    public Statement generateStatement(Long accountId, int year, int month) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Check if statement already exists
        if (statementExists(accountId, year, month)) {
            return statementRepository.findByAccountAndYearAndMonth(account, year, month)
                .orElseThrow(() -> new RuntimeException("Statement exists but could not be retrieved"));
        }
        
        // Get statement data
        MonthlyStatementDTO statementData = getMonthlyStatement(accountId, year, month);
        
        // Create new statement
        Statement statement = new Statement(account, year, month);
        statement.setOpeningBalance(statementData.getOpeningBalance());
        statement.setClosingBalance(statementData.getClosingBalance());
        statement.setTotalDeposits(statementData.getTotalDeposits());
        statement.setTotalWithdrawals(statementData.getTotalWithdrawals());
        statement.setTotalTransfersIn(statementData.getTotalTransfersIn());
        statement.setTotalTransfersOut(statementData.getTotalTransfersOut());
        statement.setTransactionCount(statementData.getTransactions().size());
        statement.setStatementType("MONTHLY");
        statement.setPdfPath("/statements/" + accountId + "/" + year + "-" + month + ".pdf");
        
        return statementRepository.save(statement);
    }

    @Override
    public boolean statementExists(Long accountId, int year, int month) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return statementRepository.existsByAccountAndYearAndMonth(account, year, month);
    }

    @Override
    public Statement getLatestStatement(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        List<Statement> statements = statementRepository.findByAccountOrderByYearDescMonthDesc(account);
        return statements.isEmpty() ? null : statements.get(0);
    }

    @Override
    public List<Statement> getStatementsBetweenDates(Long accountId, int startYear, int startMonth, 
                                                       int endYear, int endMonth) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Create a date range and filter
        LocalDateTime startDate = LocalDateTime.of(startYear, startMonth, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(endYear, endMonth, 1, 0, 0).plusMonths(1).minusNanos(1);
        
        // Get all statements and filter by date range
        return statementRepository.findByAccountOrderByYearDescMonthDesc(account).stream()
                .filter(s -> {
                    LocalDateTime statementDate = LocalDateTime.of(s.getYear(), s.getMonth(), 1, 0, 0);
                    return !statementDate.isBefore(startDate) && !statementDate.isAfter(endDate);
                })
                .collect(Collectors.toList());
    }

    // Helper method to convert Transaction to TransactionDTO
    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setAccountId(transaction.getAccountId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setDescription(transaction.getDescription());
        dto.setTimestamp(transaction.getTimestamp());
        dto.setTargetAccountId(transaction.getTargetAccountId());
        dto.setCategory(transaction.getCategory());
        return dto;
    }
}
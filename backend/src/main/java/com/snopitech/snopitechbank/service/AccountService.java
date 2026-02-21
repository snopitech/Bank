package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.AccountSummaryResponse;
import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Overdraft;
import com.snopitech.snopitechbank.model.StopPayment;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.DownloadHistory;
import com.snopitech.snopitechbank.model.Statement;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

public interface AccountService {

    Account deposit(Long accountId, double amount);

    Account withdraw(Long accountId, double amount);

    Account depositByAccountNumber(String accountNumber, double amount);

    Account withdrawByAccountNumber(String accountNumber, double amount);

    Account transfer(Long fromAccountId, Long toAccountId, double amount);

    Account transferByAccountNumber(String fromAccountNumber, String toAccountNumber, double amount);

    Account getAccountById(Long id);

    Account getAccountByAccountNumber(String accountNumber);

    AccountSummaryResponse getSummary();

    void deleteUserByAccountNumber(String accountNumber);

    MonthlyStatementDTO getMonthlyStatement(Long id, int year, int month);

    Account createCheckingAccount(User user);

    Account createSavingsAccount(User user);

    AccountSummaryResponse getSummaryByAccountId(Long id);
    
    AccountSummaryResponse getSummaryByAccountNumber(String accountNumber);

    // ============== MANAGE ACCOUNTS ==============
    List<Account> getAccountsByUserId(Long userId);

    Account updateAccountNickname(Long accountId, String nickname);
    
    // ============== CLOSE ACCOUNT ==============
    void closeAccount(Long accountId, String reason);
    void permanentlyDeleteAccount(Long accountId);

    // ============== DISABLE/ENABLE ACCOUNT ==============
void disableAccount(Long accountId);
void enableAccount(Long accountId);
    
    // ============== OVERDRAFT SERVICES ==============
    Overdraft getOverdraftSettings(Long accountId);
    Overdraft updateOverdraftSettings(Long accountId, 
                                       Boolean overdraftEnabled, 
                                       Double overdraftLimit, 
                                       Boolean autoSweepEnabled, 
                                       Long sweepAccountId);
    Overdraft initializeOverdraft(Long accountId);
    boolean canUseOverdraft(Long accountId, double amount);
    void updateOverdraftBalance(Long accountId, double amount);
    
    // ============== STOP PAYMENTS ==============
    List<StopPayment> getStopPayments(Long accountId);
    
    List<StopPayment> getActiveStopPayments(Long accountId);
    
    StopPayment placeStopPayment(Long accountId, 
                                 String checkNumber, 
                                 String payeeName,
                                 Double amount,
                                 LocalDate checkDate,
                                 String reason);
    
    void removeStopPayment(Long stopPaymentId);
    
    boolean hasActiveStopPayment(Long accountId, String checkNumber);
    
    StopPayment getStopPaymentById(Long stopPaymentId);

    // ============== DOWNLOAD HISTORY ==============
    List<DownloadHistory> getDownloadHistory(Long userId);

    List<DownloadHistory> getRecentDownloads(Long userId);

    DownloadHistory saveDownloadRecord(Long userId, 
                                       Long accountId, 
                                       String fileName, 
                                       String fileFormat,
                                       Integer transactionCount,
                                       LocalDateTime startDate,
                                       LocalDateTime endDate,
                                       String filterType,
                                       Long fileSize);

    /**
     * Export transactions for an account
     * @param accountId The account ID
     * @param format Export format (csv, pdf, qfx, ofx)
     * @param range Date range (30days, 60days, 90days, year)
     * @param startDate Custom start date
     * @param endDate Custom end date
     * @param type Transaction type filter
     * @return byte array of file content
     */
    byte[] exportTransactions(Long accountId, String format, String range, 
                              LocalDate startDate, LocalDate endDate, String type);

    // ============== NEW METHODS FOR STATEMENTS ==============

    /**
     * Export statement as PDF
     * @param accountId The account ID
     * @param year The year
     * @param month The month (1-12)
     * @return byte array of PDF content
     */
    byte[] exportStatementPdf(Long accountId, int year, int month);

    /**
     * Get all statements for an account
     * @param accountId The account ID
     * @return List of statements
     */
    List<Statement> getAccountStatements(Long accountId);

    /**
     * Get statements by year for an account
     * @param accountId The account ID
     * @param year The year
     * @return List of statements for that year
     */
    List<Statement> getStatementsByYear(Long accountId, int year);

    /**
     * Generate a new statement (if not exists)
     * @param accountId The account ID
     * @param year The year
     * @param month The month (1-12)
     * @return Generated Statement
     */
    Statement generateStatement(Long accountId, int year, int month);
}
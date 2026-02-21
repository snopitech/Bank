package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.model.Statement;
import java.util.List;

public interface StatementService {

    // Get monthly statement for an account
    MonthlyStatementDTO getMonthlyStatement(Long accountId, int year, int month);

    // Export statement as PDF
    byte[] exportStatementPdf(Long accountId, int year, int month);

    // Get all statements for an account
    List<Statement> getAccountStatements(Long accountId);

    // Get statements by year for an account
    List<Statement> getStatementsByYear(Long accountId, int year);

    // Generate a new statement (if not exists)
    Statement generateStatement(Long accountId, int year, int month);

    // Check if statement exists
    boolean statementExists(Long accountId, int year, int month);

    // Get latest statement for an account
    Statement getLatestStatement(Long accountId);

    // Get statements between dates
    List<Statement> getStatementsBetweenDates(Long accountId, int startYear, int startMonth, 
                                                int endYear, int endMonth);
}
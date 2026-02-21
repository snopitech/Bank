package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "statements")
public class Statement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "statement_month", nullable = false)
    private int month;

    @Column(name = "statement_year", nullable = false)
    private int year;

    @Column(name = "opening_balance")
    private Double openingBalance;

    @Column(name = "closing_balance")
    private Double closingBalance;

    @Column(name = "total_deposits")
    private Double totalDeposits;

    @Column(name = "total_withdrawals")
    private Double totalWithdrawals;

    @Column(name = "total_transfers_in")
    private Double totalTransfersIn;

    @Column(name = "total_transfers_out")
    private Double totalTransfersOut;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "generated_date")
    private LocalDateTime generatedDate;

    @Column(name = "is_annual")
    private Boolean isAnnual = false;

    @Column(name = "statement_type")
    private String statementType = "MONTHLY"; // MONTHLY, ANNUAL, TAX

    @Column(name = "file_size")
    private Long fileSize;

    // Constructors
    public Statement() {
        this.generatedDate = LocalDateTime.now();
    }

    public Statement(Account account, int year, int month) {
        this.account = account;
        this.year = year;
        this.month = month;
        this.generatedDate = LocalDateTime.now();
        this.statementType = "MONTHLY";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Double getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(Double openingBalance) {
        this.openingBalance = openingBalance;
    }

    public Double getClosingBalance() {
        return closingBalance;
    }

    public void setClosingBalance(Double closingBalance) {
        this.closingBalance = closingBalance;
    }

    public Double getTotalDeposits() {
        return totalDeposits;
    }

    public void setTotalDeposits(Double totalDeposits) {
        this.totalDeposits = totalDeposits;
    }

    public Double getTotalWithdrawals() {
        return totalWithdrawals;
    }

    public void setTotalWithdrawals(Double totalWithdrawals) {
        this.totalWithdrawals = totalWithdrawals;
    }

    public Double getTotalTransfersIn() {
        return totalTransfersIn;
    }

    public void setTotalTransfersIn(Double totalTransfersIn) {
        this.totalTransfersIn = totalTransfersIn;
    }

    public Double getTotalTransfersOut() {
        return totalTransfersOut;
    }

    public void setTotalTransfersOut(Double totalTransfersOut) {
        this.totalTransfersOut = totalTransfersOut;
    }

    public Integer getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(Integer transactionCount) {
        this.transactionCount = transactionCount;
    }

    public String getPdfPath() {
        return pdfPath;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    public LocalDateTime getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(LocalDateTime generatedDate) {
        this.generatedDate = generatedDate;
    }

    public Boolean getIsAnnual() {
        return isAnnual;
    }

    public void setIsAnnual(Boolean isAnnual) {
        this.isAnnual = isAnnual;
    }

    public String getStatementType() {
        return statementType;
    }

    public void setStatementType(String statementType) {
        this.statementType = statementType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    // Helper methods
    public String getMonthName() {
        return java.time.Month.of(month).toString();
    }

    public String getFormattedDate() {
        return String.format("%d-%02d", year, month);
    }
}
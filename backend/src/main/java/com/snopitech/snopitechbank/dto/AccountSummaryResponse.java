package com.snopitech.snopitechbank.dto;

import com.snopitech.snopitechbank.model.Account;
import java.util.List;

public class AccountSummaryResponse {

    private double checkingBalance;
    private double savingsBalance;
    private double totalBalance;
    private int totalAccounts;
    private Long userId;
    private List<Account> accounts;

    public AccountSummaryResponse(double checkingBalance, double savingsBalance,
                                  double totalBalance, int totalAccounts,
                                  Long userId, List<Account> accounts) {
        this.checkingBalance = checkingBalance;
        this.savingsBalance = savingsBalance;
        this.totalBalance = totalBalance;
        this.totalAccounts = totalAccounts;
        this.userId = userId;
        this.accounts = accounts;
    }

    public double getCheckingBalance() {
        return checkingBalance;
    }

    public double getSavingsBalance() {
        return savingsBalance;
    }

    public double getTotalBalance() {
        return totalBalance;
    }

    public int getTotalAccounts() {
        return totalAccounts;
    }

    public Long getUserId() {
        return userId;
    }

    public List<Account> getAccounts() {
        return accounts;
    }
}

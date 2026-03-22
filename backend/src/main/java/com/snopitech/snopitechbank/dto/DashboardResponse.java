package com.snopitech.snopitechbank.dto;

import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import java.util.List;

public class DashboardResponse {

    private User user;
    private List<Account> accounts;
    private List<TransactionDTO> recentTransactions;

    public DashboardResponse(User user, List<Account> accounts, List<TransactionDTO> recentTransactions) {
        this.user = user;
        this.accounts = accounts;
        this.recentTransactions = recentTransactions;
    }

    public User getUser() {
        return user;
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public List<TransactionDTO> getRecentTransactions() {
        return recentTransactions;
    }
}
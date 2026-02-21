package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.mapper.TransactionMapper;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Alert;
import com.snopitech.snopitechbank.model.Transaction;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AlertService alertService;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  AccountRepository accountRepository,
                                  UserRepository userRepository,
                                  AlertService alertService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.alertService = alertService;
    }

    @Override
    public TransactionDTO createTransaction(TransactionDTO dto) {

        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        if (dto.getType() == null || dto.getType().isEmpty()) {
            throw new RuntimeException("Transaction type is required");
        }

        if (!dto.getType().equals("DEPOSIT") &&
            !dto.getType().equals("WITHDRAWAL") &&
            !dto.getType().equals("TRANSFER")) {
            throw new RuntimeException("Invalid transaction type");
        }

        if (dto.getType().equals("TRANSFER")) {
            if (dto.getTargetAccountId() == null) {
                throw new RuntimeException("Target account ID is required for transfers");
            }
            if (dto.getTargetAccountId().equals(dto.getAccountId())) {
                throw new RuntimeException("Cannot transfer to the same account");
            }
        }

        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        double currentBalance = account.getBalance();
        double newBalance = currentBalance;

        String description = "";

        switch (dto.getType()) {

            case "DEPOSIT":
                newBalance = currentBalance;
                description = buildDepositDescription(dto, account);
                
                // 🚨 ALERT TRIGGER: Large Deposit (> $5,000)
                if (dto.getAmount() >= 5000) {
                    createAlert(
                        account.getUser(),
                        "LARGE_DEPOSIT",
                        "Large deposit of $" + String.format("%,.2f", dto.getAmount()) + 
                        " was made to your " + account.getAccountType() + " account",
                        "HIGH",
                        account.getId(),
                        account.getAccountNumber()
                    );
                }
                
                // 🚨 ALERT TRIGGER: Any deposit
                createAlert(
                    account.getUser(),
                    "DEPOSIT",
                    "Deposit of $" + String.format("%,.2f", dto.getAmount()) + 
                    " was made to your " + account.getAccountType() + " account",
                    "LOW",
                    account.getId(),
                    account.getAccountNumber()
                );
                break;

            case "WITHDRAWAL":
                if (dto.getAmount() > currentBalance) {
                    throw new RuntimeException("Insufficient funds for withdrawal");
                }
                newBalance = currentBalance;
                description = buildWithdrawalDescription(dto, account);
                
                // 🚨 ALERT TRIGGER: Large Withdrawal (> $2,000)
                if (dto.getAmount() >= 2000) {
                    createAlert(
                        account.getUser(),
                        "LARGE_WITHDRAWAL",
                        "Large withdrawal of $" + String.format("%,.2f", dto.getAmount()) + 
                        " was made from your " + account.getAccountType() + " account",
                        "MEDIUM",
                        account.getId(),
                        account.getAccountNumber()
                    );
                }
                break;

            case "TRANSFER":
                processTransfer(dto, account);
                newBalance = account.getBalance();
                description = buildTransferOutDescription(dto);
                break;
        }

        Transaction tx = new Transaction(
                dto.getAccountId(),
                dto.getAmount(),
                dto.getType(),
                newBalance
        );

        tx.setDescription(description);
        tx.setBalanceAfter(newBalance);

        if (dto.getType().equals("TRANSFER")) {
            tx.setTargetAccountId(dto.getTargetAccountId());
        }

        tx.setCategory(dto.getCategory());

        Transaction saved = transactionRepository.save(tx);
        return TransactionMapper.toDTO(saved);
    }

    // --------------------------
    // DESCRIPTION BUILDERS
    // --------------------------

    private String buildDepositDescription(TransactionDTO dto, Account account) {
        String holder = account.getUser().getFullName();
        String note = dto.getNote() != null && !dto.getNote().isEmpty()
                ? " — " + dto.getNote()
                : "";
        return "Deposit of $" + dto.getAmount() + " to " + holder + note;
    }

    private String buildWithdrawalDescription(TransactionDTO dto, Account fromAccount) {

        if (dto.getTargetAccountId() != null) {
            Account target = accountRepository.findById(dto.getTargetAccountId()).orElse(null);
            if (target != null) {
                return "Withdrawal of $" + dto.getAmount() +
                        " from " + fromAccount.getAccountType() +
                        " to " + target.getAccountType();
            }
        }

        if (dto.getCategory() != null) {
            return "Withdrawal of $" + dto.getAmount() + " for " + dto.getCategory();
        }

        return "Withdrawal of $" + dto.getAmount();
    }

    private String buildTransferOutDescription(TransactionDTO dto) {
        Account target = accountRepository.findById(dto.getTargetAccountId()).orElse(null);
        if (target == null) return "Transfer to account";

        String receiver = target.getUser().getFullName();
        String note = dto.getNote() != null && !dto.getNote().isEmpty()
                ? " — " + dto.getNote()
                : "";

        return "Transfer to " + receiver + note;
    }

    private String buildTransferInDescription(TransactionDTO dto, Account sourceAccount) {
        String sender = sourceAccount.getUser().getFullName();
        String note = dto.getNote() != null && !dto.getNote().isEmpty()
                ? " — " + dto.getNote()
                : "";

        return "Transfer from " + sender + note;
    }

    // --------------------------
    // TRANSFER PROCESSING
    // --------------------------

    private void processTransfer(TransactionDTO dto, Account sourceAccount) {

        Account targetAccount = accountRepository.findById(dto.getTargetAccountId())
                .orElseThrow(() -> new RuntimeException("Target account not found"));

        double sourceBalance = sourceAccount.getBalance();

        if (dto.getAmount() > sourceBalance) {
            throw new RuntimeException("Insufficient funds for transfer");
        }

        double newSourceBalance = sourceBalance - dto.getAmount();
        sourceAccount.setBalance(newSourceBalance);
        accountRepository.save(sourceAccount);

        double newTargetBalance = targetAccount.getBalance() + dto.getAmount();
        targetAccount.setBalance(newTargetBalance);
        accountRepository.save(targetAccount);

        // 🚨 ALERT TRIGGER: Transfer sent (for sender)
        createAlert(
            sourceAccount.getUser(),
            "TRANSFER_SENT",
            "You sent $" + String.format("%,.2f", dto.getAmount()) + 
            " to " + targetAccount.getUser().getFullName() + 
            " (" + targetAccount.getAccountType() + ")",
            "MEDIUM",
            sourceAccount.getId(),
            sourceAccount.getAccountNumber()
        );

        // 🚨 ALERT TRIGGER: Transfer received (for receiver)
        createAlert(
            targetAccount.getUser(),
            "TRANSFER_RECEIVED",
            "You received $" + String.format("%,.2f", dto.getAmount()) + 
            " from " + sourceAccount.getUser().getFullName() + 
            " (" + sourceAccount.getAccountType() + ")",
            "MEDIUM",
            targetAccount.getId(),
            targetAccount.getAccountNumber()
        );

        // 🚨 ALERT TRIGGER: Large Transfer (> $5,000)
        if (dto.getAmount() >= 5000) {
            createAlert(
                sourceAccount.getUser(),
                "LARGE_TRANSFER_SENT",
                "Large transfer of $" + String.format("%,.2f", dto.getAmount()) + 
                " was sent to " + targetAccount.getUser().getFullName(),
                "HIGH",
                sourceAccount.getId(),
                sourceAccount.getAccountNumber()
            );
            
            createAlert(
                targetAccount.getUser(),
                "LARGE_TRANSFER_RECEIVED",
                "Large transfer of $" + String.format("%,.2f", dto.getAmount()) + 
                " was received from " + sourceAccount.getUser().getFullName(),
                "HIGH",
                targetAccount.getId(),
                targetAccount.getAccountNumber()
            );
        }

        Transaction targetTx = new Transaction(
                dto.getTargetAccountId(),
                dto.getAmount(),
                "TRANSFER_IN",
                newTargetBalance
        );

        targetTx.setDescription(buildTransferInDescription(dto, sourceAccount));
        targetTx.setBalanceAfter(newTargetBalance);
        targetTx.setCategory("TRANSFER");

        transactionRepository.save(targetTx);
    }

    // --------------------------
    // ALERT HELPER METHOD - FIXED for Alert.java
    // --------------------------

    private void createAlert(User user, String type, String message, String priority, Long accountId, String accountNumber) {
        try {
            Alert alert = new Alert();
            alert.setUser(user);
            alert.setType(type);
            alert.setPriority(priority);
            alert.setTitle(type.replace("_", " ").toLowerCase()); // Convert SNAKE_CASE to readable title
            alert.setMessage(message);
            alert.setAccountId(accountId);
            alert.setAccountNumber(accountNumber);
            alert.setRead(false);
            alert.setTimestamp(LocalDateTime.now());
            
            // Set icon and color based on priority
            switch (priority) {
                case "HIGH":
                    alert.setIcon("🔴");
                    alert.setColor("red");
                    alert.setActionText("View Details");
                    alert.setActionUrl("/account/" + accountId);
                    break;
                case "MEDIUM":
                    alert.setIcon("🟠");
                    alert.setColor("orange");
                    alert.setActionText("View");
                    alert.setActionUrl("/account/" + accountId);
                    break;
                case "LOW":
                    alert.setIcon("🟢");
                    alert.setColor("green");
                    alert.setActionText("OK");
                    alert.setActionUrl("/account/" + accountId);
                    break;
            }
            
            alertService.createAlert(alert);
        } catch (Exception e) {
            System.err.println("Failed to create alert: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // --------------------------
    // REMAINING METHODS UNCHANGED
    // --------------------------

    @Override
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDTO> getTransactionsByAccountId(Long accountId) {
        return transactionRepository.findByAccountId(accountId)
                .stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionDTO getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(TransactionMapper::toDTO)
                .orElse(null);
    }

    @Override
    public List<TransactionDTO> getTransactionsForAccount(Long accountId) {
        return getTransactionsByAccountId(accountId);
    }

    @Override
    public Page<TransactionDTO> filterTransactions(
            String type,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String sort,
            int page,
            int size
    ) {
        List<Transaction> all = transactionRepository.findAll();

        List<Transaction> filtered = applyFilters(all, type, startDate, endDate, minAmount, maxAmount, null);

        if ("asc".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(Transaction::getTimestamp));
        } else {
            filtered.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        }

        int start = page * size;
        int end = Math.min(start + size, filtered.size());

        List<TransactionDTO> pagedContent = filtered.subList(start, end)
                .stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(pagedContent, PageRequest.of(page, size), filtered.size());
    }

    @Override
    public Page<TransactionDTO> filterTransactionsByAccount(
            Long accountId,
            String type,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String sort,
            int page,
            int size
    ) {
        List<Transaction> all = transactionRepository.findByAccountId(accountId);

        List<Transaction> filtered = applyFilters(all, type, startDate, endDate, minAmount, maxAmount, null);

        if ("asc".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(Transaction::getTimestamp));
        } else {
            filtered.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        }

        int start = page * size;
        int end = Math.min(start + size, filtered.size());

        List<TransactionDTO> pagedContent = filtered.subList(start, end)
                .stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(pagedContent, PageRequest.of(page, size), filtered.size());
    }

    private List<Transaction> applyFilters(
            List<Transaction> all,
            String type,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String category
    ) {
        return all.stream()
                .filter(tx -> type == null || tx.getType().equalsIgnoreCase(type))
                .filter(tx -> category == null ||
                        (tx.getCategory() != null && tx.getCategory().equalsIgnoreCase(category)))
                .filter(tx -> {
                    if (startDate == null) return true;
                    return tx.getTimestamp().isAfter(LocalDateTime.parse(startDate));
                })
                .filter(tx -> {
                    if (endDate == null) return true;
                    return tx.getTimestamp().isBefore(LocalDateTime.parse(endDate));
                })
                .filter(tx -> minAmount == null || tx.getAmount() >= minAmount)
                .filter(tx -> maxAmount == null || tx.getAmount() <= maxAmount)
                .collect(Collectors.toList());
    }

    @Override
    public void clearAllTransactions() {
        transactionRepository.deleteAll();
    }

    @Override
    public double calculateOpeningBalance(Long accountId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();

        List<Transaction> allForAccount = transactionRepository.findByAccountId(accountId);

        return allForAccount.stream()
                .filter(tx -> tx.getTimestamp().isBefore(startOfMonth))
                .max(Comparator.comparing(Transaction::getTimestamp))
                .map(Transaction::getBalanceAfter)
                .orElse(0.0);
    }

    @Override
    public double calculateClosingBalance(Long accountId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> allForAccount = transactionRepository.findByAccountId(accountId);

        return allForAccount.stream()
                .filter(tx -> !tx.getTimestamp().isBefore(startOfMonth)
                        && !tx.getTimestamp().isAfter(endOfMonth))
                .max(Comparator.comparing(Transaction::getTimestamp))
                .map(Transaction::getBalanceAfter)
                .orElseGet(() -> calculateOpeningBalance(accountId, year, month));
    }

    @Override
    public double sumDeposits(Long accountId, int year, int month) {
        return sumByTypeAndMonth(accountId, year, month, "DEPOSIT");
    }

    @Override
    public double sumWithdrawals(Long accountId, int year, int month) {
        return sumByTypeAndMonth(accountId, year, month, "WITHDRAWAL");
    }

    @Override
    public double sumTransfersIn(Long accountId, int year, int month) {
        return sumByTypeAndMonth(accountId, year, month, "TRANSFER_IN");
    }

    @Override
    public double sumTransfersOut(Long accountId, int year, int month) {
        return sumByTypeAndMonth(accountId, year, month, "TRANSFER");
    }

    private double sumByTypeAndMonth(Long accountId, int year, int month, String type) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59);

        return transactionRepository.findByAccountId(accountId).stream()
                .filter(tx -> tx.getType().equalsIgnoreCase(type))
                .filter(tx -> !tx.getTimestamp().isBefore(startOfMonth)
                        && !tx.getTimestamp().isAfter(endOfMonth))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    @Override
    public List<TransactionDTO> filterTransactionsByMonth(List<TransactionDTO> transactions, int year, int month) {
        return transactions.stream()
                .filter(t -> t.getTimestamp().getYear() == year)
                .filter(t -> t.getTimestamp().getMonthValue() == month)
                .collect(Collectors.toList());
    }

    @Override
    public MonthlyStatementDTO getMonthlyStatement(Long accountId, int year, int month) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        User user = account.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for account");
        }

        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(23, 59, 59);

        List<Transaction> allForAccount = transactionRepository.findByAccountId(accountId);

        List<Transaction> monthlyTransactions = allForAccount.stream()
                .filter(tx -> !tx.getTimestamp().isBefore(startOfMonth)
                        && !tx.getTimestamp().isAfter(endOfMonth))
                .sorted(Comparator.comparing(Transaction::getTimestamp))
                .collect(Collectors.toList());

        double openingBalance = calculateOpeningBalance(accountId, year, month);
        double closingBalance = calculateClosingBalance(accountId, year, month);

        double totalDeposits = sumDeposits(accountId, year, month);
        double totalWithdrawals = sumWithdrawals(accountId, year, month);
        double totalTransfersIn = sumTransfersIn(accountId, year, month);
        double totalTransfersOut = sumTransfersOut(accountId, year, month);

        List<TransactionDTO> monthlyTransactionDTOs = monthlyTransactions.stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());

        MonthlyStatementDTO statement = new MonthlyStatementDTO();
        statement.setAccountId(account.getId());
        statement.setAccountNumber(account.getAccountNumber());
        statement.setRoutingNumber(account.getRoutingNumber());
        statement.setAccountType(account.getAccountType());

        statement.setAccountHolderName(user.getFullName());
        statement.setEmail(user.getEmail());
        statement.setPhone(user.getPhone());
        statement.setAddressLine1(user.getAddressLine1());
        statement.setAddressLine2(user.getAddressLine2());
        statement.setCity(user.getCity());
        statement.setState(user.getState());
        statement.setZipCode(user.getZipCode());
        statement.setCountry(user.getCountry());

        statement.setBankName("SnopitechBank");
        String monthName = ym.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        String period = monthName + " " + startDate.getDayOfMonth() + ", " + year +
                " - " + monthName + " " + endDate.getDayOfMonth() + ", " + year;
        statement.setStatementPeriod(period);
        statement.setGeneratedAt(LocalDateTime.now());
        statement.setYear(year);
        statement.setMonth(month);

        statement.setOpeningBalance(openingBalance);
        statement.setClosingBalance(closingBalance);
        statement.setTotalDeposits(totalDeposits);
        statement.setTotalWithdrawals(totalWithdrawals);
        statement.setTotalTransfersIn(totalTransfersIn);
        statement.setTotalTransfersOut(totalTransfersOut);

        statement.setTransactions(monthlyTransactionDTOs);

        return statement;
    }

    @Override
    public void clearTransactionsByAccountId(Long accountId) {
        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        transactionRepository.deleteAll(transactions);
    }

    @Override
    public List<TransactionDTO> getTransactionsByUserId(Long userId) {
        List<Account> userAccounts = accountRepository.findByUserId(userId);
        
        if (userAccounts.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Long> accountIds = userAccounts.stream()
                .map(Account::getId)
                .collect(Collectors.toList());
        
        List<Transaction> allTransactions = new ArrayList<>();
        for (Long accountId : accountIds) {
            allTransactions.addAll(transactionRepository.findByAccountId(accountId));
        }
        
        allTransactions.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        
        return allTransactions.stream()
                .map(TransactionMapper::toDTO)
                .collect(Collectors.toList());
    }
}
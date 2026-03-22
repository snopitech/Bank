package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.AccountSummaryResponse;
import com.snopitech.snopitechbank.dto.MonthlyStatementDTO;
import com.snopitech.snopitechbank.dto.TransactionDTO;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.Alert;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.Overdraft;
import com.snopitech.snopitechbank.model.StopPayment;
import com.snopitech.snopitechbank.model.DownloadHistory;
import com.snopitech.snopitechbank.model.Transaction;
import com.snopitech.snopitechbank.model.Statement;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.OverdraftRepository;
import com.snopitech.snopitechbank.repository.StopPaymentRepository;
import com.snopitech.snopitechbank.repository.DownloadHistoryRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import com.snopitech.snopitechbank.repository.StatementRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.model.Card;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// OpenPDF imports for PDF generation
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;

@Service
public class AccountServiceImpl implements AccountService {

    private static final String ROUTING_NUMBER = "842917356";
    private static final String CHECKING_PREFIX = "58292";
    private static final String SAVINGS_PREFIX = "73420";
    
    private static final double LOW_BALANCE_THRESHOLD = 100.0;
    private static final double CRITICAL_BALANCE_THRESHOLD = 25.0;
    private static final double LARGE_DEPOSIT_THRESHOLD = 5000.0;
    private static final double LARGE_WITHDRAWAL_THRESHOLD = 2000.0;

    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final AlertService alertService;
    private final OverdraftRepository overdraftRepository;
    private final StopPaymentRepository stopPaymentRepository;
    private final DownloadHistoryRepository downloadHistoryRepository;
    private final TransactionRepository transactionRepository;
    private final StatementRepository statementRepository;
    private final CardRepository cardRepository;
    private final Random random = new Random();
    private final EmailService emailService;

    // Email service would be injected here
    // private final EmailService emailService;

   public AccountServiceImpl(AccountRepository accountRepository,
                          TransactionService transactionService,
                          UserRepository userRepository,
                          AlertService alertService,
                          OverdraftRepository overdraftRepository,
                          StopPaymentRepository stopPaymentRepository,
                          DownloadHistoryRepository downloadHistoryRepository,
                          TransactionRepository transactionRepository,
                          StatementRepository statementRepository,
                          CardRepository cardRepository,
                          EmailService emailService) {  // ← ADD THIS
    this.accountRepository = accountRepository;
    this.transactionService = transactionService;
    this.userRepository = userRepository;
    this.alertService = alertService;
    this.overdraftRepository = overdraftRepository;
    this.stopPaymentRepository = stopPaymentRepository;
    this.downloadHistoryRepository = downloadHistoryRepository;
    this.transactionRepository = transactionRepository;
    this.statementRepository = statementRepository;
    this.cardRepository = cardRepository;
    this.emailService = emailService;  // ← ADD THIS
}

    private String generateFiveDigitSuffix() {
        int num = 10000 + random.nextInt(90000);
        return String.valueOf(num);
    }

    private Account createBaseAccount(User user, String accountType, String prefix) {
        Account account = new Account();
        account.setUser(user);
        account.setOwnerName(user.getFullName());
        account.setAccountType(accountType);
        account.setBalance(0.0);
        account.setRoutingNumber(ROUTING_NUMBER);
        account.setAccountNumber(prefix + generateFiveDigitSuffix());
        return accountRepository.save(account);
    }

    @Override
    public Account createCheckingAccount(User user) {
        return createBaseAccount(user, "CHECKING", CHECKING_PREFIX);
    }

    @Override
    public Account createSavingsAccount(User user) {
        return createBaseAccount(user, "SAVINGS", SAVINGS_PREFIX);
    }

    @Override
    public Account deposit(Long accountId, double amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        double oldBalance = account.getBalance();
        account.setBalance(oldBalance + amount);
        Account updated = accountRepository.save(account);

        TransactionDTO dto = new TransactionDTO();
        dto.setAccountId(accountId);
        dto.setAmount(amount);
        dto.setType("DEPOSIT");
        transactionService.createTransaction(dto);

        if (amount >= LARGE_DEPOSIT_THRESHOLD) {
            createAlert(
                account.getUser(),
                "LARGE_DEPOSIT",
                "Large deposit of $" + String.format("%,.2f", amount) + 
                " was made to your " + account.getAccountType() + " account",
                "HIGH",
                account.getId(),
                account.getAccountNumber()
            );
        }

        return updated;
    }

    @Override
    public Account withdraw(Long accountId, double amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance() < amount) {
            createAlert(
                account.getUser(),
                "INSUFFICIENT_FUNDS",
                "Attempted to withdraw $" + String.format("%,.2f", amount) + 
                " but your " + account.getAccountType() + " account has insufficient funds",
                "MEDIUM",
                account.getId(),
                account.getAccountNumber()
            );
            throw new RuntimeException("Insufficient funds");
        }

        double oldBalance = account.getBalance();
        account.setBalance(oldBalance - amount);
        Account updated = accountRepository.save(account);

        TransactionDTO dto = new TransactionDTO();
        dto.setAccountId(accountId);
        dto.setAmount(amount);
        dto.setType("WITHDRAWAL");
        transactionService.createTransaction(dto);

        if (amount >= LARGE_WITHDRAWAL_THRESHOLD) {
            createAlert(
                account.getUser(),
                "LARGE_WITHDRAWAL",
                "Large withdrawal of $" + String.format("%,.2f", amount) + 
                " was made from your " + account.getAccountType() + " account",
                "MEDIUM",
                account.getId(),
                account.getAccountNumber()
            );
        }

        checkLowBalance(updated);

        return updated;
    }

    @Override
    public Account depositByAccountNumber(String accountNumber, double amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) throw new RuntimeException("Account not found");
        return deposit(account.getId(), amount);
    }

    @Override
    public Account withdrawByAccountNumber(String accountNumber, double amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) throw new RuntimeException("Account not found");
        return withdraw(account.getId(), amount);
    }

    @Override
    public Account transfer(Long fromAccountId, Long toAccountId, double amount) {

        TransactionDTO dto = new TransactionDTO();
        dto.setAccountId(fromAccountId);
        dto.setTargetAccountId(toAccountId);
        dto.setAmount(amount);
        dto.setType("TRANSFER");

        transactionService.createTransaction(dto);

        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        checkLowBalance(fromAccount);

        return fromAccount;
    }

    @Override
    public Account transferByAccountNumber(String fromAccountNumber, String toAccountNumber, double amount) {

        Account from = accountRepository.findByAccountNumber(fromAccountNumber);
        Account to = accountRepository.findByAccountNumber(toAccountNumber);

        if (from == null || to == null)
            throw new RuntimeException("Invalid account number(s)");

        return transfer(from.getId(), to.getId(), amount);
    }

    @Override
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Override
    public Account getAccountByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) throw new RuntimeException("Account not found");
        return account;
    }

    @Override
    public AccountSummaryResponse getSummary() {
        List<Account> accounts = accountRepository.findAll();

        double checking = accounts.stream()
                .filter(a -> "CHECKING".equalsIgnoreCase(a.getAccountType()))
                .mapToDouble(Account::getBalance)
                .sum();

        double savings = accounts.stream()
                .filter(a -> "SAVINGS".equalsIgnoreCase(a.getAccountType()))
                .mapToDouble(Account::getBalance)
                .sum();

        double totalBalance = checking + savings;
        int totalAccounts = accounts.size();

        Long userId = accounts.isEmpty() ? null : accounts.get(0).getUser().getId();

        return new AccountSummaryResponse(
                checking, savings, totalBalance, totalAccounts, userId, accounts
        );
    }

    @Override
    public void deleteUserByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) throw new RuntimeException("Account not found");

        User user = account.getUser();
        if (user == null) throw new RuntimeException("User not found");

        userRepository.delete(user);
    }

    @Override
    public MonthlyStatementDTO getMonthlyStatement(Long id, int year, int month) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        MonthlyStatementDTO dto = new MonthlyStatementDTO();
        dto.setAccountId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setAccountHolderName(account.getUser().getFullName());
        dto.setYear(year);
        dto.setMonth(month);

        // Get transactions for the month
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusNanos(1);
        
        List<Transaction> monthlyTransactions = transactionRepository
            .findTransactionsByDateRange(account.getId(), startDate, endDate);
        
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
        List<TransactionDTO> transactionDTOs = new ArrayList<>();
        for (Transaction t : monthlyTransactions) {
            TransactionDTO transactionDTO = new TransactionDTO();
            transactionDTO.setId(t.getId());
            transactionDTO.setAccountId(t.getAccountId());
            transactionDTO.setAmount(t.getAmount());
            transactionDTO.setType(t.getType());
            transactionDTO.setDescription(t.getDescription());
            transactionDTO.setTimestamp(t.getTimestamp());
            transactionDTOs.add(transactionDTO);
        }
        
        dto.setTransactions(transactionDTOs);

        return dto;
    }

    @Override
    public AccountSummaryResponse getSummaryByAccountId(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        double checking = "CHECKING".equalsIgnoreCase(account.getAccountType())
                ? account.getBalance()
                : 0.0;

        double savings = "SAVINGS".equalsIgnoreCase(account.getAccountType())
                ? account.getBalance()
                : 0.0;

        double totalBalance = account.getBalance();
        int totalAccounts = 1;
        Long userId = account.getUser() != null ? account.getUser().getId() : null;

        return new AccountSummaryResponse(
                checking,
                savings,
                totalBalance,
                totalAccounts,
                userId,
                List.of(account)
        );
    }

    @Override
    public AccountSummaryResponse getSummaryByAccountNumber(String accountNumber) {
        Account account = getAccountByAccountNumber(accountNumber);
        
        double checking = "CHECKING".equalsIgnoreCase(account.getAccountType())
                ? account.getBalance()
                : 0.0;
        
        double savings = "SAVINGS".equalsIgnoreCase(account.getAccountType())
                ? account.getBalance()
                : 0.0;
        
        double totalBalance = account.getBalance();
        int totalAccounts = 1;
        Long userId = account.getUser() != null ? account.getUser().getId() : null;
        
        return new AccountSummaryResponse(
                checking,
                savings,
                totalBalance,
                totalAccounts,
                userId,
                List.of(account)
        );
    }
    
    // ============== MANAGE ACCOUNTS ==============

    @Override
    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    @Override
    public Account updateAccountNickname(Long accountId, String nickname) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        account.setNickname(nickname);
        return accountRepository.save(account);
    }

    private void sendAccountClosureEmail(Account account, String reason) {
    try {
        User user = account.getUser();
        String userEmail = user.getEmail();
        String userName = user.getFirstName() + " " + user.getLastName();
        String accountType = account.getAccountType();
        String lastFour = account.getAccountNumber().substring(account.getAccountNumber().length() - 4);
        
        String subject = "Important: Your SnopitechBank Account Has Been Closed";
        
        String htmlContent = "<!DOCTYPE html>" +
            "<html><head><style>" +
            "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
            ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: #dc2626; color: white; padding: 20px; text-align: center; }" +
            ".content { padding: 20px; background: #f9fafb; }" +
            ".footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }" +
            "</style></head><body>" +
            "<div class='container'>" +
            "<div class='header'><h2>Account Closure Notice</h2></div>" +
            "<div class='content'>" +
            "<p>Dear " + userName + ",</p>" +
            "<p>We regret to inform you that your " + accountType + " account (ending in " + lastFour + ") has been closed effective immediately.</p>" +
            "<p><strong>Reason for closure:</strong> " + reason + "</p>" +
            "<p>If you have any questions or concerns, please contact us:</p>" +
            "<p>📞 +1 (713) 870-1132<br>📧 snopitech@gmail.com</p>" +
            "</div>" +
            "<div class='footer'>" +
            "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
            "</div></div></body></html>";
        
        emailService.sendEmail(userEmail, subject, htmlContent);
        
    } catch (Exception e) {
        System.err.println("Failed to send account closure email: " + e.getMessage());
    }
}


    // ============== CLOSE ACCOUNT ==============

    @Override
    public void closeAccount(Long accountId, String reason) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (account.isClosed()) {
            throw new RuntimeException("Account is already closed");
        }

        
        
        // BALANCE CHECK REMOVED - Admins can close accounts with any balance
        // No balance validation for admin closures
        
        account.setClosed(true);
        account.setClosedDate(LocalDateTime.now());
        account.setClosureReason(reason);
        
        accountRepository.save(account);

        
        
        createAlert(
            account.getUser(),
            "ACCOUNT_CLOSED",
            "Your " + account.getAccountType() + " account has been closed. Reason: " + reason,
            "HIGH",
            account.getId(),
            account.getAccountNumber()
        );
        
        // Send email notification to user
        sendAccountClosureEmail(account, reason);
    }

    /**
     * Send email notification to user when account is closed by admin
     */
    @SuppressWarnings("unused")
    private void sendAccountClosureEmail1(Account account, String reason) {
        try {
            User user = account.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String accountType = account.getAccountType();
            String lastFour = account.getAccountNumber().substring(account.getAccountNumber().length() - 4);
            
            String subject = "Important: Your SnopitechBank Account Has Been Closed";
            
            String body = String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your %s account (ending in %s) has been closed effective immediately.\n\n" +
                "Reason for closure: %s\n\n" +
                "If you have any questions or concerns, please contact us:\n" +
                "📞 +1 (713) 870-1132\n" +
                "📧 snopitech@gmail.com\n\n" +
                "We appreciate your understanding.\n\n" +
                "Sincerely,\n" +
                "SnopitechBank Account Services Team",
                userName,
                accountType,
                lastFour,
                reason
            );
            
            // Log the email for now
            System.out.println("\n=== ACCOUNT CLOSURE EMAIL ===");
            System.out.println("To: " + userEmail);
            System.out.println("Subject: " + subject);
            System.out.println("Body:\n" + body);
            System.out.println("==============================\n");
            
            // TODO: Implement actual email sending here
            // emailService.sendEmail(userEmail, subject, body);
            
        } catch (Exception e) {
            System.err.println("Failed to send account closure email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void permanentlyDeleteAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Balance check removed - allow deletion with any balance
        // if (account.getBalance() > 0) {
        //     throw new RuntimeException("Cannot delete account with positive balance");
        // }
        
        // First, delete any associated cards (fixes foreign key constraint)
        List<Card> cards = cardRepository.findByAccountId(accountId);
        if (cards != null && !cards.isEmpty()) {
            cardRepository.deleteAll(cards);
        }
        
        // Delete any associated stop payments
        List<StopPayment> stopPayments = stopPaymentRepository.findByAccountId(accountId);
        if (stopPayments != null && !stopPayments.isEmpty()) {
            stopPaymentRepository.deleteAll(stopPayments);
        }
        
        // Delete any associated overdraft settings
        overdraftRepository.findByAccountId(accountId).ifPresent(overdraft -> {
            overdraftRepository.delete(overdraft);
        });
        
        // Delete any associated download history records
        List<DownloadHistory> downloadHistories = downloadHistoryRepository.findByAccountId(accountId);
        if (downloadHistories != null && !downloadHistories.isEmpty()) {
            downloadHistoryRepository.deleteAll(downloadHistories);
        }
        
        // Delete any associated statements
        List<Statement> statements = statementRepository.findByAccountId(accountId);
        if (statements != null && !statements.isEmpty()) {
            statementRepository.deleteAll(statements);
        }
        
        // Delete any associated transactions
        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        if (transactions != null && !transactions.isEmpty()) {
            transactionRepository.deleteAll(transactions);
        }
        
        // Finally, delete the account
        accountRepository.delete(account);
    }

    // ============== DISABLE/ENABLE ACCOUNT ==============

    @Override
    public void disableAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (account.isClosed()) {
            throw new RuntimeException("Cannot disable a closed account");
        }
        
        if (account.isDisabled()) {
            throw new RuntimeException("Account is already disabled");
        }
        
        account.setDisabled(true);
        account.setDisabledDate(LocalDateTime.now());
        
        accountRepository.save(account);
        
        createAlert(
            account.getUser(),
            "ACCOUNT_DISABLED",
            "Your " + account.getAccountType() + " account has been temporarily disabled by an administrator.",
            "HIGH",
            account.getId(),
            account.getAccountNumber()
        );
    }

    @Override
    public void enableAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (account.isClosed()) {
            throw new RuntimeException("Cannot enable a closed account");
        }
        
        if (!account.isDisabled()) {
            throw new RuntimeException("Account is not disabled");
        }
        
        account.setDisabled(false);
        account.setDisabledDate(null);
        
        accountRepository.save(account);
        
        createAlert(
            account.getUser(),
            "ACCOUNT_ENABLED",
            "Your " + account.getAccountType() + " account has been re-enabled by an administrator.",
            "MEDIUM",
            account.getId(),
            account.getAccountNumber()
        );
    }

    // ============== OVERDRAFT SERVICES ==============

    @Override
    public Overdraft getOverdraftSettings(Long accountId) {
        accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return overdraftRepository.findByAccountId(accountId)
            .orElseGet(() -> initializeOverdraft(accountId));
    }

    @Override
    public Overdraft updateOverdraftSettings(Long accountId, 
                                              Boolean overdraftEnabled, 
                                              Double overdraftLimit, 
                                              Boolean autoSweepEnabled, 
                                              Long sweepAccountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (!"CHECKING".equalsIgnoreCase(account.getAccountType())) {
            throw new RuntimeException("Overdraft protection is only available for checking accounts");
        }
        
        Overdraft overdraft = overdraftRepository.findByAccountId(accountId)
            .orElse(new Overdraft(accountId));
        
        if (overdraftEnabled != null) {
            overdraft.setOverdraftEnabled(overdraftEnabled);
        }
        
        if (overdraftLimit != null) {
            if (overdraftLimit < 0) {
                throw new RuntimeException("Overdraft limit cannot be negative");
            }
            overdraft.setOverdraftLimit(overdraftLimit);
        }
        
        if (autoSweepEnabled != null) {
            overdraft.setAutoSweepEnabled(autoSweepEnabled);
        }
        
        if (sweepAccountId != null) {
            Account sweepAccount = accountRepository.findById(sweepAccountId)
                .orElseThrow(() -> new RuntimeException("Sweep account not found"));
            
            if (!sweepAccount.getUser().getId().equals(account.getUser().getId())) {
                throw new RuntimeException("Sweep account must belong to the same user");
            }
            
            overdraft.setSweepAccountId(sweepAccountId);
        }
        
        if (overdraft.getOverdraftEnabled() && overdraft.getOverdraftLimit() > 0) {
            if (overdraft.getOverdraftLimit() <= 500) {
                overdraft.setInterestRate(5.0);
            } else if (overdraft.getOverdraftLimit() <= 2000) {
                overdraft.setInterestRate(4.0);
            } else {
                overdraft.setInterestRate(3.0);
            }
        } else {
            overdraft.setInterestRate(0.0);
        }
        
        Overdraft saved = overdraftRepository.save(overdraft);
        
        createAlert(
            account.getUser(),
            "OVERDRAFT_UPDATED",
            "Your overdraft protection settings have been updated. " +
            "Enabled: " + (saved.getOverdraftEnabled() ? "Yes" : "No") +
            (saved.getOverdraftEnabled() ? ", Limit: $" + String.format("%,.2f", saved.getOverdraftLimit()) : ""),
            "MEDIUM",
            account.getId(),
            account.getAccountNumber()
        );
        
        return saved;
    }

    @Override
    public Overdraft initializeOverdraft(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (!"CHECKING".equalsIgnoreCase(account.getAccountType())) {
            return null;
        }
        
        if (overdraftRepository.existsByAccountId(accountId)) {
            return overdraftRepository.findByAccountId(accountId).get();
        }
        
        Overdraft overdraft = new Overdraft(accountId);
        overdraft.setOverdraftEnabled(false);
        overdraft.setOverdraftLimit(0.0);
        overdraft.setCurrentOverdraftBalance(0.0);
        overdraft.setAutoSweepEnabled(false);
        overdraft.setInterestRate(0.0);
        
        return overdraftRepository.save(overdraft);
    }

    @Override
    public boolean canUseOverdraft(Long accountId, double amount) {
        try {
            Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
            
            if (!"CHECKING".equalsIgnoreCase(account.getAccountType())) {
                return false;
            }
            
            Overdraft overdraft = overdraftRepository.findByAccountId(accountId)
                .orElse(null);
            
            if (overdraft == null || !overdraft.getOverdraftEnabled()) {
                return false;
            }
            
            double availableOverdraft = overdraft.getAvailableOverdraft();
            double totalAvailable = account.getBalance() + availableOverdraft;
            
            return totalAvailable >= amount;
            
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void updateOverdraftBalance(Long accountId, double amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (account.getBalance() >= 0) {
            return;
        }
        
        Overdraft overdraft = overdraftRepository.findByAccountId(accountId)
            .orElseThrow(() -> new RuntimeException("Overdraft settings not found"));
        
        if (!overdraft.getOverdraftEnabled()) {
            return;
        }
        
        double overdrawnAmount = Math.abs(account.getBalance());
        overdraft.setCurrentOverdraftBalance(overdrawnAmount);
        
        if (overdrawnAmount == 0) {
            overdraft.setCurrentOverdraftBalance(0.0);
        }
        
        overdraftRepository.save(overdraft);
        
        if (overdrawnAmount > 0) {
            createAlert(
                account.getUser(),
                "OVERDRAFT_USED",
                "Your account is using overdraft protection. Current overdraft balance: $" + 
                String.format("%,.2f", overdrawnAmount) + 
                " (Limit: $" + String.format("%,.2f", overdraft.getOverdraftLimit()) + ")",
                "HIGH",
                account.getId(),
                account.getAccountNumber()
            );
        }
    }

    // ============== STOP PAYMENTS ==============

    @Override
    public List<StopPayment> getStopPayments(Long accountId) {
        accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return stopPaymentRepository.findByAccountId(accountId);
    }

    @Override
    public List<StopPayment> getActiveStopPayments(Long accountId) {
        accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        return stopPaymentRepository.findByAccountIdAndStatus(accountId, "ACTIVE");
    }

    @Override
    public StopPayment placeStopPayment(Long accountId, 
                                         String checkNumber, 
                                         String payeeName,
                                         Double amount,
                                         LocalDate checkDate,
                                         String reason) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        if (checkNumber == null || checkNumber.trim().isEmpty()) {
            throw new RuntimeException("Check number is required");
        }
        
        if (stopPaymentRepository.hasActiveStopPayment(accountId, checkNumber)) {
            throw new RuntimeException("An active stop payment already exists for check #" + checkNumber);
        }
        
        StopPayment stopPayment = new StopPayment(accountId, checkNumber, reason);
        
        if (payeeName != null && !payeeName.trim().isEmpty()) {
            stopPayment.setPayeeName(payeeName);
        }
        
        if (amount != null && amount > 0) {
            stopPayment.setAmount(amount);
        }
        
        if (checkDate != null) {
            stopPayment.setCheckDate(checkDate);
        }
        
        stopPayment.setFeeCharged(35.00);
        
        StopPayment saved = stopPaymentRepository.save(stopPayment);
        
        createAlert(
            account.getUser(),
            "STOP_PAYMENT_PLACED",
            "Stop payment placed on check #" + checkNumber + 
            (payeeName != null ? " payable to " + payeeName : "") + 
            ". Fee: $" + String.format("%,.2f", saved.getFeeCharged()),
            "MEDIUM",
            account.getId(),
            account.getAccountNumber()
        );
        
        return saved;
    }

    @Override
    public void removeStopPayment(Long stopPaymentId) {
        StopPayment stopPayment = stopPaymentRepository.findById(stopPaymentId)
            .orElseThrow(() -> new RuntimeException("Stop payment not found with id: " + stopPaymentId));
        
        Account account = accountRepository.findById(stopPayment.getAccountId())
            .orElseThrow(() -> new RuntimeException("Associated account not found"));
        
        if (!"ACTIVE".equals(stopPayment.getStatus())) {
            throw new RuntimeException("Stop payment is not active (current status: " + stopPayment.getStatus() + ")");
        }
        
        int updated = stopPaymentRepository.releaseStopPayment(stopPaymentId);
        
        if (updated > 0) {
            createAlert(
                account.getUser(),
                "STOP_PAYMENT_RELEASED",
                "Stop payment on check #" + stopPayment.getCheckNumber() + " has been released",
                "LOW",
                account.getId(),
                account.getAccountNumber()
            );
        } else {
            throw new RuntimeException("Failed to release stop payment");
        }
    }

    @Override
    public boolean hasActiveStopPayment(Long accountId, String checkNumber) {
        return stopPaymentRepository.hasActiveStopPayment(accountId, checkNumber);
    }

    @Override
    public StopPayment getStopPaymentById(Long stopPaymentId) {
        return stopPaymentRepository.findById(stopPaymentId)
            .orElseThrow(() -> new RuntimeException("Stop payment not found with id: " + stopPaymentId));
    }
 
    // ============== DOWNLOAD HISTORY METHODS ==============

    @Override
    public List<DownloadHistory> getDownloadHistory(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findByUserOrderByDownloadDateDesc(user);
    }

    @Override
    public List<DownloadHistory> getRecentDownloads(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return downloadHistoryRepository.findTop10ByUserOrderByDownloadDateDesc(user);
    }

    @Override
    public DownloadHistory saveDownloadRecord(Long userId, 
                                               Long accountId, 
                                               String fileName, 
                                               String fileFormat,
                                               Integer transactionCount,
                                               LocalDateTime startDate,
                                               LocalDateTime endDate,
                                               String filterType,
                                               Long fileSize) {
        // Get user and account
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Create download history record
        DownloadHistory downloadHistory = new DownloadHistory(user, account, fileName, fileFormat);
        downloadHistory.setTransactionCount(transactionCount);
        downloadHistory.setDateRangeStart(startDate);
        downloadHistory.setDateRangeEnd(endDate);
        downloadHistory.setFilterType(filterType);
        downloadHistory.setFileSize(fileSize);
        downloadHistory.setIpAddress("127.0.0.1");
        
        return downloadHistoryRepository.save(downloadHistory);
    }

    // ============== TRANSACTIONS EXPORT ==============

    @Override
    public byte[] exportTransactions(Long accountId, String format, String range, 
                                      LocalDate startDate, LocalDate endDate, String type) {
        
        // Verify account exists
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Get filtered transactions
        List<Transaction> transactions = getFilteredTransactions(accountId, range, startDate, endDate, type);
        
        // Generate file based on format
        switch (format.toLowerCase()) {
            case "csv":
                return generateCSV(account, transactions);
            case "pdf":
                return generatePDF(account, transactions);
            case "qfx":
                return generateQFX(account, transactions);
            case "ofx":
                return generateOFX(account, transactions);
            default:
                throw new RuntimeException("Unsupported format: " + format);
        }
    }

    // Helper method to get filtered transactions
    private List<Transaction> getFilteredTransactions(Long accountId, String range, 
                                                       LocalDate startDate, LocalDate endDate, 
                                                       String type) {
        // This would call your transaction repository with filters
        List<Transaction> mockTransactions = new ArrayList<>();
        
        // Create mock transactions for testing
        for (int i = 1; i <= 10; i++) {
            Transaction t = new Transaction();
            t.setId((long) i);
            t.setAccountId(accountId);
            t.setTimestamp(LocalDateTime.now().minusDays(i));
            t.setDescription("Transaction " + i);
            t.setAmount(i % 2 == 0 ? 100.0 * i : -50.0 * i);
            t.setType(i % 2 == 0 ? "DEPOSIT" : "WITHDRAWAL");
            mockTransactions.add(t);
        }
        
        return mockTransactions;
    }

    // CSV Generator
    private byte[] generateCSV(Account account, List<Transaction> transactions) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Description,Amount,Type\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (Transaction t : transactions) {
            String dateStr = "";
            if (t.getTimestamp() != null) {
                dateStr = t.getTimestamp().format(formatter);
            }
            
            csv.append(String.format("%s,%s,%.2f,%s\n",
                dateStr,
                t.getDescription() != null ? t.getDescription() : "",
                t.getAmount(),
                t.getType()
            ));
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // PDF Generator - REAL PDF using OpenPDF
    private byte[] generatePDF(Account account, List<Transaction> transactions) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Transaction Statement", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Account Information Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);
            
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font infoBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            
            addInfoRow(infoTable, "Account Number:", account.getAccountNumber(), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Account Type:", account.getAccountType(), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Account Holder:", account.getOwnerName(), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Current Balance:", "$" + String.format("%,.2f", account.getBalance()), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Generated:", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), infoBoldFont, infoFont);
            
            document.add(infoTable);
            
            // Summary
            double totalCredits = transactions.stream().filter(t -> t.getAmount() > 0).mapToDouble(Transaction::getAmount).sum();
            double totalDebits = transactions.stream().filter(t -> t.getAmount() < 0).mapToDouble(t -> Math.abs(t.getAmount())).sum();
            
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);
            
            addSummaryCell(summaryTable, "Total Credits:", "$" + String.format("%,.2f", totalCredits), true);
            addSummaryCell(summaryTable, "Total Debits:", "$" + String.format("%,.2f", totalDebits), false);
            addSummaryCell(summaryTable, "Net Change:", "$" + String.format("%,.2f", totalCredits - totalDebits), totalCredits - totalDebits >= 0);
            addSummaryCell(summaryTable, "Transactions:", String.valueOf(transactions.size()), true);
            
            document.add(summaryTable);
            
            // Transactions Table
            if (!transactions.isEmpty()) {
                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{2, 3, 1, 2});
                
                // Table Header
                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
                addCell(table, "Date", headerFont, true);
                addCell(table, "Description", headerFont, true);
                addCell(table, "Type", headerFont, true);
                addCell(table, "Amount", headerFont, true);
                
                // Table Rows
                Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                
                for (Transaction t : transactions) {
                    String dateStr = t.getTimestamp() != null ? t.getTimestamp().format(dateFormatter) : "";
                    
                    addCell(table, dateStr, cellFont, false);
                    addCell(table, t.getDescription() != null ? t.getDescription() : "", cellFont, false);
                    addCell(table, t.getType(), cellFont, false);
                    
                    // Amount with color (green for positive, red for negative)
                    String amountStr = (t.getAmount() > 0 ? "+" : "-") + "$" + String.format("%,.2f", Math.abs(t.getAmount()));
                    PdfPCell amountCell = new PdfPCell(new Phrase(amountStr, cellFont));
                    amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    if (t.getAmount() > 0) {
                        amountCell.setPhrase(new Phrase(amountStr, FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(0, 128, 0))));
                    } else {
                        amountCell.setPhrase(new Phrase(amountStr, FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(255, 0, 0))));
                    }
                    table.addCell(amountCell);
                }
                
                document.add(table);
            } else {
                Paragraph noData = new Paragraph("No transactions found for the selected period.", 
                    FontFactory.getFont(FontFactory.HELVETICA, 12));
                noData.setAlignment(Element.ALIGN_CENTER);
                document.add(noData);
            }
            
            // Footer
            Paragraph footer = new Paragraph("This is an electronically generated statement. No signature required.\n" +
                "Generated by SnopitechBank © " + LocalDate.now().getYear(), 
                FontFactory.getFont(FontFactory.HELVETICA, 9, new java.awt.Color(128, 128, 128)));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    // ============== NEW STATEMENTS METHODS ==============

    @Override
    public byte[] exportStatementPdf(Long accountId, int year, int month) {
        // Get the statement data
        MonthlyStatementDTO statement = getMonthlyStatement(accountId, year, month);
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Monthly Statement", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Statement Period
            Font periodFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            String monthName = java.time.Month.of(month).toString();
            Paragraph period = new Paragraph(monthName + " " + year, periodFont);
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(20);
            document.add(period);
            
            // Account Information Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);
            
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font infoBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            
            addInfoRow(infoTable, "Account Number:", account.getAccountNumber(), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Account Type:", account.getAccountType(), infoBoldFont, infoFont);
            addInfoRow(infoTable, "Account Holder:", account.getOwnerName(), infoBoldFont, infoFont);
            
            document.add(infoTable);
            
            // Summary Table
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);
            
            addInfoRow(summaryTable, "Opening Balance:", "$" + String.format("%,.2f", statement.getOpeningBalance()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Closing Balance:", "$" + String.format("%,.2f", statement.getClosingBalance()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Total Deposits:", "$" + String.format("%,.2f", statement.getTotalDeposits()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Total Withdrawals:", "$" + String.format("%,.2f", statement.getTotalWithdrawals()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Total Transfers In:", "$" + String.format("%,.2f", statement.getTotalTransfersIn()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Total Transfers Out:", "$" + String.format("%,.2f", statement.getTotalTransfersOut()), infoBoldFont, infoFont);
            addInfoRow(summaryTable, "Total Transactions:", String.valueOf(statement.getTransactions().size()), infoBoldFont, infoFont);
            
            document.add(summaryTable);
            
            // Footer
            Paragraph footer = new Paragraph("This is an electronically generated statement. No signature required.\n" +
                "Generated by SnopitechBank © " + LocalDate.now().getYear(), 
                FontFactory.getFont(FontFactory.HELVETICA, 9, new java.awt.Color(128, 128, 128)));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate statement PDF", e);
        }
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
        if (statementRepository.existsByAccountAndYearAndMonth(account, year, month)) {
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
        
        return statementRepository.save(statement);
    }

    // Helper method for info table rows
    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(0);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(0);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    // Helper method for summary cells
    private void addSummaryCell(PdfPTable table, String label, String value, boolean isPositive) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(0);
        cell.setPadding(8);
        
        Paragraph p = new Paragraph();
        p.add(new Phrase(label + " ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        
        java.awt.Color color = isPositive ? new java.awt.Color(0, 128, 0) : new java.awt.Color(255, 0, 0);
        p.add(new Phrase(value, FontFactory.getFont(FontFactory.HELVETICA, 10, color)));
        
        cell.addElement(p);
        table.addCell(cell);
    }

    // Helper method for table cells
    private void addCell(PdfPTable table, String content, Font font, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(8);
        if (isHeader) {
            cell.setBackgroundColor(new java.awt.Color(74, 85, 104));
            cell.setPhrase(new Phrase(content, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, java.awt.Color.WHITE)));
        }
        table.addCell(cell);
    }

    // QFX Generator (Quicken format)
    private byte[] generateQFX(Account account, List<Transaction> transactions) {
        StringBuilder qfx = new StringBuilder();
        qfx.append("OFXHEADER:100\n");
        qfx.append("DATA:OFXSGML\n");
        qfx.append("VERSION:102\n");
        qfx.append("SECURITY:NONE\n");
        qfx.append("ENCODING:USASCII\n");
        qfx.append("CHARSET:1252\n");
        qfx.append("COMPRESSION:NONE\n");
        qfx.append("OLDFILEUID:NONE\n");
        qfx.append("NEWFILEUID:NONE\n\n");
        
        qfx.append("<OFX>\n");
        qfx.append("<SIGNONMSGSRSV1>\n");
        qfx.append("<SONRS>\n");
        qfx.append("<STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>\n");
        qfx.append("<DTSERVER>").append(LocalDateTime.now()).append("</DTSERVER>\n");
        qfx.append("<LANGUAGE>ENG</LANGUAGE>\n");
        qfx.append("</SONRS>\n");
        qfx.append("</SIGNONMSGSRSV1>\n");
        
        qfx.append("<BANKMSGSRSV1>\n");
        qfx.append("<STMTTRNRS>\n");
        qfx.append("<TRNUID>1</TRNUID>\n");
        qfx.append("<STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>\n");
        qfx.append("<STMTRS>\n");
        qfx.append("<CURDEF>USD</CURDEF>\n");
        qfx.append("<BANKACCTFROM>\n");
        qfx.append("<BANKID>").append(account.getRoutingNumber()).append("</BANKID>\n");
        qfx.append("<ACCTID>").append(account.getAccountNumber()).append("</ACCTID>\n");
        qfx.append("<ACCTTYPE>").append(account.getAccountType()).append("</ACCTTYPE>\n");
        qfx.append("</BANKACCTFROM>\n");
        
        qfx.append("<BANKTRANLIST>\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        for (Transaction t : transactions) {
            String dateStr = "";
            if (t.getTimestamp() != null) {
                dateStr = t.getTimestamp().format(formatter);
            }
            
            qfx.append("<STMTTRN>\n");
            qfx.append("<TRNTYPE>").append(t.getType()).append("</TRNTYPE>\n");
            qfx.append("<DTPOSTED>").append(dateStr).append("</DTPOSTED>\n");
            qfx.append("<TRNAMT>").append(t.getAmount()).append("</TRNAMT>\n");
            qfx.append("<FITID>").append(t.getId()).append("</FITID>\n");
            qfx.append("<NAME>").append(t.getDescription() != null ? t.getDescription() : "").append("</NAME>\n");
            qfx.append("</STMTTRN>\n");
        }
        qfx.append("</BANKTRANLIST>\n");
        qfx.append("<LEDGERBAL>\n");
        qfx.append("<BALAMT>").append(account.getBalance()).append("</BALAMT>\n");
        qfx.append("<DTASOF>").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))).append("</DTASOF>\n");
        qfx.append("</LEDGERBAL>\n");
        qfx.append("</STMTRS>\n");
        qfx.append("</STMTTRNRS>\n");
        qfx.append("</BANKMSGSRSV1>\n");
        qfx.append("</OFX>");
        
        return qfx.toString().getBytes(StandardCharsets.UTF_8);
    }

    // OFX Generator
    private byte[] generateOFX(Account account, List<Transaction> transactions) {
        // OFX is similar to QFX
        return generateQFX(account, transactions);
    }

    // --------------------------
    // 🚨 ALERT HELPER METHODS
    // --------------------------

    private void createAlert(User user, String type, String message, String priority, Long accountId, String accountNumber) {
        try {
            Alert alert = new Alert();
            alert.setUser(user);
            alert.setType(type);
            alert.setPriority(priority);
            alert.setTitle(type.replace("_", " ").toLowerCase());
            alert.setMessage(message);
            alert.setAccountId(accountId);
            alert.setAccountNumber(accountNumber);
            alert.setRead(false);
            alert.setTimestamp(LocalDateTime.now());
            
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

    private void checkLowBalance(Account account) {
        double balance = account.getBalance();
        
        if (balance <= CRITICAL_BALANCE_THRESHOLD) {
            createAlert(
                account.getUser(),
                "CRITICAL_LOW_BALANCE",
                "CRITICAL: Your " + account.getAccountType() + 
                " account balance is critically low! Current balance: $" + 
                String.format("%,.2f", balance),
                "HIGH",
                account.getId(),
                account.getAccountNumber()
            );
        } else if (balance <= LOW_BALANCE_THRESHOLD) {
            createAlert(
                account.getUser(),
                "LOW_BALANCE",
                "Your " + account.getAccountType() + 
                " account balance is low. Current balance: $" + 
                String.format("%,.2f", balance),
                "MEDIUM",
                account.getId(),
                account.getAccountNumber()
            );
        }
        
        if (balance < 0) {
            createAlert(
                account.getUser(),
                "NEGATIVE_BALANCE",
                "Your " + account.getAccountType() + 
                " account is overdrawn. Current balance: $" + 
                String.format("%,.2f", balance),
                "HIGH",
                account.getId(),
                account.getAccountNumber()
            );
        }
    }
}
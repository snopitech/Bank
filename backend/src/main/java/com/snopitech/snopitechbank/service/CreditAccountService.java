package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.CreditAccount;
import com.snopitech.snopitechbank.model.CreditCard;
import com.snopitech.snopitechbank.model.CreditTransaction; // ADDED
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CreditAccountRepository;
import com.snopitech.snopitechbank.repository.CreditCardRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.CreditTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("unused")
@Service
public class CreditAccountService {

    @Autowired
    private CreditAccountRepository creditAccountRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    @SuppressWarnings("unused")
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private CreditTransactionRepository creditTransactionRepository;
    
    @Autowired // ADDED
    private AccountService accountService; // ADDED

    // Get account by ID
    public CreditAccount getAccount(Long id) {
        return creditAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
    }

    // Get account by account number
    public CreditAccount getAccountByNumber(String accountNumber) {
        return creditAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
    }

    // Get all accounts for a user
    public List<CreditAccount> getUserAccounts(Long userId) {
        return creditAccountRepository.findByUserId(userId);
    }

    // Get active accounts for a user
    public List<CreditAccount> getUserActiveAccounts(Long userId) {
        return creditAccountRepository.findByUserIdAndStatus(userId, "ACTIVE");
    }

    // Get account details with cards
    public CreditAccount getAccountWithCards(Long accountId) {
        CreditAccount account = getAccount(accountId);
        // Cards are loaded via JPA relationship
        return account;
    }

    // Freeze account (admin or user)
    @Transactional
    public CreditAccount freezeAccount(Long accountId, String reason) {
        CreditAccount account = getAccount(accountId);
        
        if (!account.isActive()) {
            throw new RuntimeException("Account is not active");
        }

        account.setStatus("FROZEN");
        account.setClosureReason(reason);
        
        // Also freeze all cards
        for (CreditCard card : account.getCards()) {
            card.setStatus("FROZEN");
            card.setFrozenDate(LocalDateTime.now());
            creditCardRepository.save(card);
        }
        
        CreditAccount frozenAccount = creditAccountRepository.save(account);
        
        // ==================== SEND FREEZE EMAIL ====================
        try {
            User user = account.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String maskedAccount = account.getAccountNumber() != null && account.getAccountNumber().length() > 4 
                ? "****" + account.getAccountNumber().substring(account.getAccountNumber().length() - 4)
                : account.getMaskedAccountNumber();
            
            String subject = "Your SnopitechBank Credit Account Has Been Frozen";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Account Frozen</h1></div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>This email is to inform you that your credit account ending in <strong>" + maskedAccount + "</strong> has been frozen.</p>" +
                "<p><strong>Reason:</strong> " + reason + "</p>" +
                "<p><strong>Date:</strong> " + LocalDateTime.now().toString() + "</p>" +
                "<p>While frozen, you will not be able to make purchases or access credit on this account.</p>" +
                "<p>If you did not request this freeze or have any questions, please contact our support team immediately:</p>" +
                "<p>📞 +1 (713) 870-1132<br>✉️ snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            System.out.println("✅ Credit account freeze email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the freeze
            System.err.println("⚠️ Failed to send freeze email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return frozenAccount;
    }

    // Unfreeze account
    @Transactional
    public CreditAccount unfreezeAccount(Long accountId) {
        CreditAccount account = getAccount(accountId);
        
        if (!account.isFrozen()) {
            throw new RuntimeException("Account is not frozen");
        }

        account.setStatus("ACTIVE");
        account.setClosureReason(null);
        
        // Unfreeze cards that were frozen (not replaced or cancelled)
        for (CreditCard card : account.getCards()) {
            if ("FROZEN".equals(card.getStatus())) {
                card.setStatus("ACTIVE");
                card.setFrozenDate(null);
                creditCardRepository.save(card);
            }
        }
        
        CreditAccount unfrozenAccount = creditAccountRepository.save(account);
        
        // ==================== SEND UNFREEZE EMAIL ====================
        try {
            User user = account.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String maskedAccount = account.getAccountNumber() != null && account.getAccountNumber().length() > 4 
                ? "****" + account.getAccountNumber().substring(account.getAccountNumber().length() - 4)
                : account.getMaskedAccountNumber();
            
            String subject = "Your SnopitechBank Credit Account Has Been Unfrozen";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Account Unfrozen</h1></div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>This email is to inform you that your credit account ending in <strong>" + maskedAccount + "</strong> has been unfrozen.</p>" +
                "<p><strong>Date:</strong> " + LocalDateTime.now().toString() + "</p>" +
                "<p>You can now resume normal use of your account.</p>" +
                "<p>If you have any questions, please contact our support team:</p>" +
                "<p>📞 +1 (713) 870-1132<br>✉️ snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            System.out.println("✅ Credit account unfreeze email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the unfreeze
            System.err.println("⚠️ Failed to send unfreeze email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return unfrozenAccount;
    }

    // Close account
    @Transactional
    public CreditAccount closeAccount(Long accountId, String reason) {
        CreditAccount account = getAccount(accountId);
        
        if (account.getCurrentBalance() > 0) {
            throw new RuntimeException("Cannot close account with outstanding balance");
        }

        account.setStatus("CLOSED");
        account.setClosedDate(LocalDateTime.now());
        account.setClosureReason(reason);
        
        // Close all cards
        for (CreditCard card : account.getCards()) {
            card.setStatus("CANCELLED");
            creditCardRepository.save(card);
        }
        
        CreditAccount closedAccount = creditAccountRepository.save(account);
        
        // ==================== SEND CLOSURE EMAIL ====================
        try {
            User user = account.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() + " " + user.getLastName();
            String maskedAccount = account.getAccountNumber() != null && account.getAccountNumber().length() > 4 
                ? "****" + account.getAccountNumber().substring(account.getAccountNumber().length() - 4)
                : account.getMaskedAccountNumber();
            
            String subject = "Your SnopitechBank Credit Account Has Been Closed";
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 30px; background: #f9f9f9; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Credit Account Closure Confirmation</h1></div>" +
                "<div class='content'>" +
                "<p>Dear " + userName + ",</p>" +
                "<p>This email confirms that your credit account ending in <strong>" + maskedAccount + "</strong> has been closed as requested.</p>" +
                "<p><strong>Closure Reason:</strong> " + reason + "</p>" +
                "<p><strong>Closure Date:</strong> " + LocalDateTime.now().toString() + "</p>" +
                "<p><strong>Final Balance:</strong> $0.00</p>" +
                "<p>If you did not request this closure or have any questions, please contact our support team immediately:</p>" +
                "<p>📞 +1 (713) 870-1132<br>✉️ snopitech@gmail.com</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© " + java.time.Year.now().getValue() + " SnopitechBank. All rights reserved.</p>" +
                "</div></div></body></html>";
            
            emailService.sendEmail(userEmail, subject, htmlContent);
            System.out.println("✅ Credit account closure email sent to: " + userEmail);
            
        } catch (Exception e) {
            // Log error but don't fail the closure
            System.err.println("⚠️ Failed to send credit account closure email: " + e.getMessage());
        }
        // ==================== END EMAIL ====================
        
        return closedAccount;
    }

    // Make a payment to credit account (ORIGINAL METHOD - KEPT FOR BACKWARD COMPATIBILITY)
    @Transactional
    public CreditAccount makePayment(Long accountId, Double amount) {
        CreditAccount account = getAccount(accountId);
        
        if (!account.isActive()) {
            throw new RuntimeException("Account is not active");
        }

        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be positive");
        }

        if (amount > account.getCurrentBalance()) {
            throw new RuntimeException("Payment amount exceeds current balance");
        }

        account.setCurrentBalance(account.getCurrentBalance() - amount);
        account.setLastPaymentDate(LocalDateTime.now());

        // Update all cards with new balance
        for (CreditCard card : account.getCards()) {
            card.setCurrentBalance(account.getCurrentBalance());
            card.setAvailableCredit(account.getAvailableCredit());
            creditCardRepository.save(card);
        }

        return creditAccountRepository.save(account);
    }

    // ==================== NEW METHOD - Make payment from source account ==================== // ADDED
    /**
     * Make a payment to credit account from a source account (checking/savings/business)
     * @param accountId The credit account ID
     * @param sourceAccountId The source account ID to withdraw from
     * @param amount The payment amount
     * @return Updated credit account
     */
    @Transactional
    public CreditAccount makePaymentFromSource(Long accountId, Long sourceAccountId, Double amount) {
        CreditAccount creditAccount = getAccount(accountId);
        
        if (!creditAccount.isActive()) {
            throw new RuntimeException("Credit account is not active");
        }

        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be positive");
        }

        if (amount > creditAccount.getCurrentBalance()) {
            throw new RuntimeException("Payment amount exceeds credit card balance");
        }

        // Withdraw from source account (checking/savings/business)
        // This will throw an exception if insufficient funds
        accountService.withdraw(sourceAccountId, amount);

        // Update credit account balance
        creditAccount.setCurrentBalance(creditAccount.getCurrentBalance() - amount);
        creditAccount.setLastPaymentDate(LocalDateTime.now());

        // Update all cards with new balance
        for (CreditCard card : creditAccount.getCards()) {
            card.setCurrentBalance(creditAccount.getCurrentBalance());
            card.setAvailableCredit(creditAccount.getAvailableCredit());
            creditCardRepository.save(card);
        }

        // Create credit transaction record
        CreditTransaction transaction = new CreditTransaction();
        transaction.setCreditAccount(creditAccount);
        transaction.setAmount(amount);
        transaction.setType("PAYMENT");
        transaction.setStatus("COMPLETED");
        transaction.setDescription("Payment from account ID: " + sourceAccountId);
        creditTransactionRepository.save(transaction);

        return creditAccountRepository.save(creditAccount);
    }
    // ==================== END NEW METHOD ==================== // ADDED

    // Get accounts with high utilization (over 80%)
    public List<CreditAccount> getHighUtilizationAccounts() {
        return creditAccountRepository.findHighUtilizationAccounts(0.8);
    }
     
    // Get accounts eligible for increase
    public List<CreditAccount> getAccountsEligibleForIncrease() {
        return creditAccountRepository.findAccountsEligibleForIncrease();
    }
       
   public List<CreditTransaction> getAccountTransactions(Long accountId) {
    // First verify account exists
    @SuppressWarnings("unused")
    CreditAccount account = getAccount(accountId);
    
    // Return transactions from the repository
    return creditTransactionRepository.findByCreditAccountIdOrderByTimestampDesc(accountId);
}

    // Admin: Get all accounts with filters
    public List<CreditAccount> getAllAccounts(String status) {
        if (status != null && !status.isEmpty()) {
            return creditAccountRepository.findByStatus(status);
        }
        return creditAccountRepository.findAll();
    }
    
    // Get all accounts for a user with cards loaded
    public List<CreditAccount> getUserAccountsWithCards(Long userId) {
        System.out.println("=== getUserAccountsWithCards called for userId: " + userId);
        
        List<CreditAccount> accounts = creditAccountRepository.findByUserId(userId);
        System.out.println("Accounts found in repository: " + accounts.size());
        
        accounts.forEach(account -> {
            System.out.println("Account ID: " + account.getId());
            System.out.println("  Account Number: " + account.getAccountNumber());
            System.out.println("  Status: " + account.getStatus());
            
            // Force initialization of cards to avoid lazy loading issues
            if (account.getCards() != null) {
                int cardCount = account.getCards().size();
                System.out.println("  Cards found: " + cardCount);
                
                account.getCards().forEach(card -> {
                    System.out.println("    Card ID: " + card.getId());
                    System.out.println("    Card Type: " + card.getCardType());
                    System.out.println("    Card Status: " + card.getStatus());
                    System.out.println("    Masked Number: " + card.getMaskedCardNumber());
                });
            } else {
                System.out.println("  Cards collection is NULL for account " + account.getId());
            }
        });
        
        return accounts;
    }

    // ==================== NEW METHOD - Clear Transactions ====================
    // Clear all transactions for a credit account
    @Transactional
    public void clearTransactions(Long accountId) {
        CreditAccount account = getAccount(accountId);
        
        // Optional: Log warning if clearing active account transactions
        if (account.isActive()) {
            System.out.println("⚠️ WARNING: Clearing transactions for ACTIVE credit account ID: " + accountId);
        }
        
        // Delete all transactions for this account
        creditTransactionRepository.deleteByCreditAccountId(accountId);
        
        System.out.println("✅ Transactions cleared for credit account ID: " + accountId);
    }
    // ==================== END NEW METHOD ====================

    // Get account statistics for admin
    public AccountStatistics getAccountStatistics() {
        AccountStatistics stats = new AccountStatistics();
        
        stats.setTotalAccounts(creditAccountRepository.count());
        stats.setActiveAccounts(creditAccountRepository.findByStatus("ACTIVE").size());
        stats.setFrozenAccounts(creditAccountRepository.findByStatus("FROZEN").size());
        stats.setClosedAccounts(creditAccountRepository.findByStatus("CLOSED").size());
        stats.setTotalOutstandingBalance(creditAccountRepository.getTotalOutstandingBalance());
        stats.setAverageCreditLimit(creditAccountRepository.getAverageCreditLimit());
        
        return stats;
    }

    // Inner class for statistics
    public static class AccountStatistics {
        private long totalAccounts;
        private long activeAccounts;
        private long frozenAccounts;
        private long closedAccounts;
        private Double totalOutstandingBalance;
        private Double averageCreditLimit;

        // Getters and setters
        public long getTotalAccounts() { return totalAccounts; }
        public void setTotalAccounts(long totalAccounts) { this.totalAccounts = totalAccounts; }

        public long getActiveAccounts() { return activeAccounts; }
        public void setActiveAccounts(long activeAccounts) { this.activeAccounts = activeAccounts; }

        public long getFrozenAccounts() { return frozenAccounts; }
        public void setFrozenAccounts(long frozenAccounts) { this.frozenAccounts = frozenAccounts; }

        public long getClosedAccounts() { return closedAccounts; }
        public void setClosedAccounts(long closedAccounts) { this.closedAccounts = closedAccounts; }

        public Double getTotalOutstandingBalance() { return totalOutstandingBalance; }
        public void setTotalOutstandingBalance(Double totalOutstandingBalance) { this.totalOutstandingBalance = totalOutstandingBalance; }

        public Double getAverageCreditLimit() { return averageCreditLimit; }
        public void setAverageCreditLimit(Double averageCreditLimit) { this.averageCreditLimit = averageCreditLimit; }
    }
}
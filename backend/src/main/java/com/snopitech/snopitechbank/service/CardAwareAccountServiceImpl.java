package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.OverdraftRepository;
import com.snopitech.snopitechbank.repository.StopPaymentRepository;
import com.snopitech.snopitechbank.repository.DownloadHistoryRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import com.snopitech.snopitechbank.repository.StatementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardAwareAccountServiceImpl extends AccountServiceImpl {

    private CardService cardService;

    public CardAwareAccountServiceImpl(
            AccountRepository accountRepository,
            TransactionService transactionService,
            UserRepository userRepository,
            AlertService alertService,
            OverdraftRepository overdraftRepository,
            StopPaymentRepository stopPaymentRepository,
            DownloadHistoryRepository downloadHistoryRepository,
            TransactionRepository transactionRepository,
            StatementRepository statementRepository,
            CardRepository cardRepository,
            EmailService emailService) {  // ← Added EmailService
        
        super(accountRepository, transactionService, userRepository, alertService,
              overdraftRepository, stopPaymentRepository, downloadHistoryRepository,
              transactionRepository, statementRepository, cardRepository, emailService); // ← Added emailService
    }

    @Autowired
    public void setCardService(CardService cardService) {
        this.cardService = cardService;
    }

    @Override
    @Transactional
    public Account createCheckingAccount(User user) {
        // Call the parent method to create the account
        Account account = super.createCheckingAccount(user);
        
        // Automatically generate cards for the new checking account
        generateCardsForAccount(account);
        
        return account;
    }

    @Override
    @Transactional
    public Account createSavingsAccount(User user) {
        // Savings accounts don't get cards by default
        return super.createSavingsAccount(user);
    }

    /**
     * Generate both physical and virtual cards for a checking account
     */
    private void generateCardsForAccount(Account account) {
        if (cardService == null) {
            System.err.println("CardService not initialized - skipping card generation for account: " + account.getId());
            return;
        }
        
        try {
            // Generate physical card
            cardService.generateCardForAccount(account, "PHYSICAL");
            
            // Generate virtual card
            cardService.generateCardForAccount(account, "VIRTUAL");
            
            // Log success
            System.out.println("Cards generated successfully for account: " + account.getId());
        } catch (Exception e) {
            // Log error but don't fail account creation
            System.err.println("Failed to generate cards for account " + account.getId() + ": " + e.getMessage());
        }
    }
}
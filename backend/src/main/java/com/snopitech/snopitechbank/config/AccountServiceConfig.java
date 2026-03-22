package com.snopitech.snopitechbank.config;

import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.OverdraftRepository;
import com.snopitech.snopitechbank.repository.StopPaymentRepository;
import com.snopitech.snopitechbank.repository.DownloadHistoryRepository;
import com.snopitech.snopitechbank.repository.TransactionRepository;
import com.snopitech.snopitechbank.repository.StatementRepository;
import com.snopitech.snopitechbank.repository.CardRepository;
import com.snopitech.snopitechbank.service.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AccountServiceConfig {

    @Bean
    @Primary
    public AccountService accountService(
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
            CardService cardService,
            EmailService emailService) {  // ← ADD EmailService parameter
        
        CardAwareAccountServiceImpl service = new CardAwareAccountServiceImpl(
            accountRepository,
            transactionService,
            userRepository,
            alertService,
            overdraftRepository,
            stopPaymentRepository,
            downloadHistoryRepository,
            transactionRepository,
            statementRepository,
            cardRepository,
            emailService  // ← ADD emailService here
        );
        
        service.setCardService(cardService);
        
        return service;
    }
}
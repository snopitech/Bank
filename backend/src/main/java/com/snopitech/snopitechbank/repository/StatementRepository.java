package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Statement;
import com.snopitech.snopitechbank.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StatementRepository extends JpaRepository<Statement, Long> {

    // Find statement for a specific account and month
    Optional<Statement> findByAccountAndYearAndMonth(Account account, int year, int month);

    // Find all statements for an account ordered by year and month descending
    List<Statement> findByAccountOrderByYearDescMonthDesc(Account account);

    // Find statements by year for an account
    List<Statement> findByAccountAndYearOrderByMonthDesc(Account account, int year);

    List<Statement> findByAccountId(Long accountId);

    // Find annual statements
    List<Statement> findByAccountAndStatementTypeOrderByYearDesc(Account account, String statementType);

    // Check if statement exists
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Statement s WHERE s.account = :account AND s.year = :year AND s.month = :month")
    boolean existsByAccountAndYearAndMonth(@Param("account") Account account, @Param("year") int year, @Param("month") int month);

    // Get latest statement for an account
    Optional<Statement> findFirstByAccountOrderByYearDescMonthDesc(Account account);
}
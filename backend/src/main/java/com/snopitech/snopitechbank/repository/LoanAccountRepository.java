package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.LoanAccount;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanAccountRepository extends JpaRepository<LoanAccount, Long> {

    // ⭐ FIND BY USER
    List<LoanAccount> findByUser(User user);
    
    List<LoanAccount> findByUserId(Long userId);
    
    // ⭐ FIND ACTIVE LOANS FOR USER
    List<LoanAccount> findByUserIdAndStatus(Long userId, String status);
    
    @Query("SELECT l FROM LoanAccount l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    List<LoanAccount> findActiveLoansByUserId(@Param("userId") Long userId);
    
    // ⭐ FIND BY ACCOUNT NUMBER
    Optional<LoanAccount> findByAccountNumber(String accountNumber);
    
    // ⭐ FIND BY APPLICATION ID
    Optional<LoanAccount> findByApplicationId(Long applicationId);
    
    // ⭐ COUNT USER'S ACTIVE LOANS
    @Query("SELECT COUNT(l) FROM LoanAccount l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    int countActiveLoansByUserId(@Param("userId") Long userId);
    
    // ⭐ GET TOTAL OUTSTANDING FOR USER
    @Query("SELECT COALESCE(SUM(l.outstandingBalance), 0) FROM LoanAccount l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    Double getTotalOutstandingByUserId(@Param("userId") Long userId);
    
    // ⭐ FIND LOANS DUE SOON (next 30 days)
    @Query("SELECT l FROM LoanAccount l WHERE l.status = 'ACTIVE' AND l.nextPaymentDate BETWEEN :start AND :end")
    List<LoanAccount> findLoansDueBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    // ⭐ FIND DELINQUENT LOANS (past due date)
    @Query("SELECT l FROM LoanAccount l WHERE l.status = 'ACTIVE' AND l.nextPaymentDate < :currentDate")
    List<LoanAccount> findDelinquentLoans(@Param("currentDate") LocalDate currentDate);
    
    // ⭐ STATISTICS FOR ADMIN
    @Query("SELECT COUNT(l) FROM LoanAccount l WHERE l.status = 'ACTIVE'")
    long countActiveLoans();
    
    @Query("SELECT COUNT(l) FROM LoanAccount l WHERE l.status = 'PAID'")
    long countPaidLoans();
    
    @Query("SELECT COUNT(l) FROM LoanAccount l WHERE l.status = 'DEFAULTED'")
    long countDefaultedLoans();
    
    @Query("SELECT COALESCE(SUM(l.outstandingBalance), 0) FROM LoanAccount l WHERE l.status = 'ACTIVE'")
    Double getTotalOutstandingBalance();
    
    @Query("SELECT COALESCE(AVG(l.interestRate), 0) FROM LoanAccount l WHERE l.status = 'ACTIVE'")
    Double getAverageInterestRate();
}

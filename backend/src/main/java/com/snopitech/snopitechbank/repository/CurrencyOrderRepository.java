package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.CurrencyOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CurrencyOrderRepository extends JpaRepository<CurrencyOrder, Long> {

    // Find all orders for a user
    List<CurrencyOrder> findByUserId(Long userId);

    // Find orders by status
    List<CurrencyOrder> findByStatus(String status);

    // Find orders by currency
    List<CurrencyOrder> findByToCurrency(String toCurrency);

    // Find orders by date range
    List<CurrencyOrder> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    // Find orders by user and status
    List<CurrencyOrder> findByUserIdAndStatus(Long userId, String status);

    // Find pending orders
    @Query("SELECT c FROM CurrencyOrder c WHERE c.status = 'PENDING'")
    List<CurrencyOrder> findPendingOrders();

    // Calculate total amount ordered for a currency
    @Query("SELECT SUM(c.toAmount) FROM CurrencyOrder c WHERE c.toCurrency = :currency AND c.status = 'COMPLETED'")
    Double getTotalOrderedForCurrency(@Param("currency") String currency);

    // Get order statistics for a user
    @Query("SELECT c.status, COUNT(c) FROM CurrencyOrder c WHERE c.user.id = :userId GROUP BY c.status")
    List<Object[]> getOrderStatistics(@Param("userId") Long userId);

    // Find orders by delivery method
    List<CurrencyOrder> findByDeliveryMethod(String deliveryMethod);

    // Find orders by user and date range
    List<CurrencyOrder> findByUserIdAndOrderDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
}

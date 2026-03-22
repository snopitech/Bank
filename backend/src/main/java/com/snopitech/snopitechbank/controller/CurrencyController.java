package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.CurrencyOrderDTO;
import com.snopitech.snopitechbank.dto.CurrencyOrderRequest;
import com.snopitech.snopitechbank.dto.ExchangeRateDTO;
import com.snopitech.snopitechbank.service.CurrencyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    @Autowired
    private CurrencyService currencyService;

    // ==================== EXCHANGE RATES ====================

    /**
     * GET /api/currency/rates - Get current exchange rates
     */
    @GetMapping("/rates")
    public ResponseEntity<List<ExchangeRateDTO>> getExchangeRates() {
        List<ExchangeRateDTO> rates = currencyService.getExchangeRates();
        return ResponseEntity.ok(rates);
    }

    /**
     * GET /api/currency/rate/{toCurrency} - Get exchange rate for specific currency
     */
    @GetMapping("/rate/{toCurrency}")
    public ResponseEntity<ExchangeRateDTO> getExchangeRate(@PathVariable String toCurrency) {
        ExchangeRateDTO rate = currencyService.getExchangeRate(toCurrency);
        return ResponseEntity.ok(rate);
    }

    /**
     * GET /api/currency/calculate - Calculate amount in target currency
     */
    @GetMapping("/calculate")
    public ResponseEntity<?> calculateAmount(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam Double amount) {
        
        try {
            Map<String, Object> calculation = currencyService.calculateAmount(fromCurrency, toCurrency, amount);
            return ResponseEntity.ok(calculation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== CURRENCY ORDERS ====================

    /**
     * POST /api/currency/order - Order foreign currency
     */
    @PostMapping("/order")
    public ResponseEntity<?> orderCurrency(
            @RequestParam Long userId,
            @Valid @RequestBody CurrencyOrderRequest request) {
        
        try {
            CurrencyOrderDTO order = currencyService.orderCurrency(userId, request);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/currency/orders/user/{userId} - Get all orders for a user
     */
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<CurrencyOrderDTO>> getUserOrders(@PathVariable Long userId) {
        List<CurrencyOrderDTO> orders = currencyService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/currency/orders/{orderId} - Get order by ID
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<CurrencyOrderDTO> getOrderById(@PathVariable Long orderId) {
        CurrencyOrderDTO order = currencyService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * POST /api/currency/orders/{orderId}/cancel - Cancel an order
     */
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            CurrencyOrderDTO order = currencyService.cancelOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * PUT /api/currency/admin/orders/{orderId}/status - Update order status (admin only)
     */
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        
        try {
            // TODO: Add admin authentication check
            CurrencyOrderDTO order = currencyService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
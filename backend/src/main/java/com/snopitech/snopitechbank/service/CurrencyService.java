package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.CurrencyOrderDTO;
import com.snopitech.snopitechbank.dto.CurrencyOrderRequest;
import com.snopitech.snopitechbank.dto.ExchangeRateDTO;
import com.snopitech.snopitechbank.model.CurrencyOrder;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.CurrencyOrderRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CurrencyService {

    @Autowired
    private CurrencyOrderRepository currencyOrderRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== EXCHANGE RATES ====================

/**
 * Get current exchange rates (simulated - in production, call external API)
 */
public List<ExchangeRateDTO> getExchangeRates() {
    List<ExchangeRateDTO> rates = new ArrayList<>();
    LocalDateTime now = LocalDateTime.now();

    // ==================== MAJOR WORLD CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "EUR", 0.92, now, "€", "Eurozone"));
    rates.add(new ExchangeRateDTO("USD", "GBP", 0.79, now, "£", "United Kingdom"));
    rates.add(new ExchangeRateDTO("USD", "JPY", 148.50, now, "¥", "Japan"));
    rates.add(new ExchangeRateDTO("USD", "CAD", 1.35, now, "C$", "Canada"));
    rates.add(new ExchangeRateDTO("USD", "AUD", 1.52, now, "A$", "Australia"));
    rates.add(new ExchangeRateDTO("USD", "CHF", 0.88, now, "CHF", "Switzerland"));
    rates.add(new ExchangeRateDTO("USD", "CNY", 7.19, now, "¥", "China"));
    rates.add(new ExchangeRateDTO("USD", "INR", 83.12, now, "₹", "India"));
    rates.add(new ExchangeRateDTO("USD", "MXN", 16.95, now, "$", "Mexico"));
    rates.add(new ExchangeRateDTO("USD", "BRL", 4.97, now, "R$", "Brazil"));
    rates.add(new ExchangeRateDTO("USD", "ZAR", 18.76, now, "R", "South Africa"));
    rates.add(new ExchangeRateDTO("USD", "SGD", 1.34, now, "S$", "Singapore"));
    rates.add(new ExchangeRateDTO("USD", "HKD", 7.82, now, "HK$", "Hong Kong"));
    rates.add(new ExchangeRateDTO("USD", "NZD", 1.64, now, "NZ$", "New Zealand"));
    rates.add(new ExchangeRateDTO("USD", "KRW", 1330.50, now, "₩", "South Korea"));
    rates.add(new ExchangeRateDTO("USD", "RUB", 92.50, now, "₽", "Russia"));

    // ==================== WEST AFRICAN CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "NGN", 1550.50, now, "₦", "Nigeria")); // Nigerian Naira
    rates.add(new ExchangeRateDTO("USD", "GHS", 14.20, now, "GH₵", "Ghana")); // Ghanaian Cedi
    rates.add(new ExchangeRateDTO("USD", "XOF", 605.00, now, "CFA", "Benin, Burkina Faso, Guinea-Bissau, Ivory Coast, Mali, Niger, Senegal, Togo")); // West African CFA Franc
    rates.add(new ExchangeRateDTO("USD", "GNF", 8600.00, now, "FG", "Guinea")); // Guinean Franc
    rates.add(new ExchangeRateDTO("USD", "LRD", 190.00, now, "L$", "Liberia")); // Liberian Dollar
    rates.add(new ExchangeRateDTO("USD", "SLL", 21000.00, now, "Le", "Sierra Leone")); // Sierra Leonean Leone
    rates.add(new ExchangeRateDTO("USD", "CVE", 103.00, now, "$", "Cape Verde")); // Cape Verdean Escudo
    rates.add(new ExchangeRateDTO("USD", "MRU", 40.00, now, "UM", "Mauritania")); // Mauritanian Ouguiya

    // ==================== CENTRAL AFRICAN CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "XAF", 605.00, now, "FCFA", "Cameroon, Central African Republic, Chad, Congo, Equatorial Guinea, Gabon")); // Central African CFA Franc
    rates.add(new ExchangeRateDTO("USD", "CDF", 2700.00, now, "FC", "DR Congo")); // Congolese Franc
    rates.add(new ExchangeRateDTO("USD", "AOA", 830.00, now, "Kz", "Angola")); // Angolan Kwanza
    rates.add(new ExchangeRateDTO("USD", "STN", 22.50, now, "Db", "São Tomé and Príncipe")); // São Tomé and Príncipe Dobra

    // ==================== EAST AFRICAN CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "KES", 145.30, now, "KSh", "Kenya")); // Kenyan Shilling
    rates.add(new ExchangeRateDTO("USD", "TZS", 2600.00, now, "TSh", "Tanzania")); // Tanzanian Shilling
    rates.add(new ExchangeRateDTO("USD", "UGX", 3800.50, now, "USh", "Uganda")); // Ugandan Shilling
    rates.add(new ExchangeRateDTO("USD", "RWF", 1300.00, now, "FRw", "Rwanda")); // Rwandan Franc
    rates.add(new ExchangeRateDTO("USD", "BIF", 2850.00, now, "FBu", "Burundi")); // Burundian Franc
    rates.add(new ExchangeRateDTO("USD", "ETB", 56.80, now, "Br", "Ethiopia")); // Ethiopian Birr
    rates.add(new ExchangeRateDTO("USD", "ERN", 15.00, now, "Nfk", "Eritrea")); // Eritrean Nakfa
    rates.add(new ExchangeRateDTO("USD", "DJF", 178.00, now, "Fdj", "Djibouti")); // Djiboutian Franc
    rates.add(new ExchangeRateDTO("USD", "SOS", 570.00, now, "Sh", "Somalia")); // Somali Shilling
    rates.add(new ExchangeRateDTO("USD", "SSP", 950.00, now, "£", "South Sudan")); // South Sudanese Pound
    rates.add(new ExchangeRateDTO("USD", "MWK", 1700.00, now, "MK", "Malawi")); // Malawian Kwacha
    rates.add(new ExchangeRateDTO("USD", "ZMW", 27.50, now, "ZK", "Zambia")); // Zambian Kwacha
    rates.add(new ExchangeRateDTO("USD", "MZN", 63.50, now, "MT", "Mozambique")); // Mozambican Metical
    rates.add(new ExchangeRateDTO("USD", "SCR", 13.50, now, "₨", "Seychelles")); // Seychellois Rupee
    rates.add(new ExchangeRateDTO("USD", "KMF", 450.00, now, "CF", "Comoros")); // Comorian Franc
    rates.add(new ExchangeRateDTO("USD", "MGA", 4500.00, now, "Ar", "Madagascar")); // Malagasy Ariary
    rates.add(new ExchangeRateDTO("USD", "MUR", 46.20, now, "₨", "Mauritius")); // Mauritian Rupee

    // ==================== NORTH AFRICAN CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "EGP", 48.50, now, "E£", "Egypt")); // Egyptian Pound
    rates.add(new ExchangeRateDTO("USD", "MAD", 10.05, now, "DH", "Morocco")); // Moroccan Dirham
    rates.add(new ExchangeRateDTO("USD", "DZD", 135.00, now, "دج", "Algeria")); // Algerian Dinar
    rates.add(new ExchangeRateDTO("USD", "TND", 3.12, now, "DT", "Tunisia")); // Tunisian Dinar
    rates.add(new ExchangeRateDTO("USD", "LYD", 4.85, now, "LD", "Libya")); // Libyan Dinar
    rates.add(new ExchangeRateDTO("USD", "SDG", 600.00, now, "ج.س", "Sudan")); // Sudanese Pound

    // ==================== SOUTHERN AFRICAN CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "ZAR", 18.76, now, "R", "South Africa")); // South African Rand (already listed)
    rates.add(new ExchangeRateDTO("USD", "BWP", 13.75, now, "P", "Botswana")); // Botswana Pula
    rates.add(new ExchangeRateDTO("USD", "NAD", 18.76, now, "$", "Namibia")); // Namibian Dollar
    rates.add(new ExchangeRateDTO("USD", "SZL", 18.76, now, "E", "Eswatini")); // Swazi Lilangeni
    rates.add(new ExchangeRateDTO("USD", "LSL", 18.76, now, "L", "Lesotho")); // Lesotho Loti
    rates.add(new ExchangeRateDTO("USD", "ZWL", 322.00, now, "Z$", "Zimbabwe")); // Zimbabwean Dollar

    // ==================== ADDITIONAL GLOBAL CURRENCIES ====================
    rates.add(new ExchangeRateDTO("USD", "AED", 3.67, now, "د.إ", "UAE"));
    rates.add(new ExchangeRateDTO("USD", "SAR", 3.75, now, "﷼", "Saudi Arabia"));
    rates.add(new ExchangeRateDTO("USD", "QAR", 3.64, now, "﷼", "Qatar"));
    rates.add(new ExchangeRateDTO("USD", "KWD", 0.31, now, "د.ك", "Kuwait"));
    rates.add(new ExchangeRateDTO("USD", "BHD", 0.38, now, ".د.ب", "Bahrain"));
    rates.add(new ExchangeRateDTO("USD", "OMR", 0.38, now, "﷼", "Oman"));
    rates.add(new ExchangeRateDTO("USD", "JOD", 0.71, now, "د.ا", "Jordan"));
    rates.add(new ExchangeRateDTO("USD", "ILS", 3.65, now, "₪", "Israel"));
    rates.add(new ExchangeRateDTO("USD", "TRY", 31.50, now, "₺", "Turkey"));
    rates.add(new ExchangeRateDTO("USD", "IDR", 15600.00, now, "Rp", "Indonesia"));
    rates.add(new ExchangeRateDTO("USD", "MYR", 4.72, now, "RM", "Malaysia"));
    rates.add(new ExchangeRateDTO("USD", "THB", 35.80, now, "฿", "Thailand"));
    rates.add(new ExchangeRateDTO("USD", "VND", 24500.00, now, "₫", "Vietnam"));
    rates.add(new ExchangeRateDTO("USD", "PHP", 55.50, now, "₱", "Philippines"));
    rates.add(new ExchangeRateDTO("USD", "PKR", 278.00, now, "₨", "Pakistan"));
    rates.add(new ExchangeRateDTO("USD", "BDT", 109.50, now, "৳", "Bangladesh"));
    rates.add(new ExchangeRateDTO("USD", "LKR", 305.00, now, "₨", "Sri Lanka"));
    rates.add(new ExchangeRateDTO("USD", "NPR", 133.00, now, "₨", "Nepal"));
    rates.add(new ExchangeRateDTO("USD", "AFN", 72.00, now, "؋", "Afghanistan"));

    return rates;
}
    /**
     * Get exchange rate for specific currency
     */
    public ExchangeRateDTO getExchangeRate(String toCurrency) {
        return getExchangeRates().stream()
                .filter(rate -> rate.getToCurrency().equals(toCurrency))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Exchange rate not found for: " + toCurrency));
    }

    /**
     * Calculate amount in target currency
     */
    public Map<String, Object> calculateAmount(String fromCurrency, String toCurrency, Double amount) {
        if (!"USD".equals(fromCurrency)) {
            throw new RuntimeException("Only USD is supported as source currency");
        }

        ExchangeRateDTO rate = getExchangeRate(toCurrency);
        Double convertedAmount = amount * rate.getRate();
        Double fee = calculateFee(amount);
        Double totalUsd = amount + fee;

        Map<String, Object> result = new HashMap<>();
        result.put("fromCurrency", fromCurrency);
        result.put("toCurrency", toCurrency);
        result.put("fromAmount", amount);
        result.put("toAmount", convertedAmount);
        result.put("exchangeRate", rate.getRate());
        result.put("fee", fee);
        result.put("totalUsd", totalUsd);
        result.put("rateLastUpdated", rate.getLastUpdated());

        return result;
    }

    /**
     * Calculate service fee based on amount
     */
    private Double calculateFee(Double amount) {
        if (amount <= 100) {
            return 5.0;
        } else if (amount <= 500) {
            return 10.0;
        } else if (amount <= 1000) {
            return 15.0;
        } else {
            return amount * 0.01; // 1% for large amounts
        }
    }

    // ==================== CURRENCY ORDERS ====================

    /**
     * Order foreign currency
     */
    @Transactional
    public CurrencyOrderDTO orderCurrency(Long userId, CurrencyOrderRequest request) {
        // Validate request
        if (!request.isValid()) {
            throw new RuntimeException("Invalid order request");
        }

        // Get user and account
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Verify account belongs to user
        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Account does not belong to this user");
        }

        // Get exchange rate
        ExchangeRateDTO rate = getExchangeRate(request.getToCurrency());

        // Calculate amounts
        Double toAmount = request.getAmount() * rate.getRate();
        Double fee = calculateFee(request.getAmount());
        Double totalUsd = request.getAmount() + fee;

        // Check if account has sufficient funds
        if (account.getBalance() < totalUsd) {
            throw new RuntimeException("Insufficient funds. Required: $" + 
                String.format("%.2f", totalUsd) + " (including fee)");
        }

        // Create order
        CurrencyOrder order = new CurrencyOrder(
            user,
            account,
            request.getFromCurrency(),
            request.getToCurrency(),
            request.getAmount(),
            toAmount,
            rate.getRate(),
            request.getDeliveryMethod()
        );

        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setNotes(request.getNotes());
        order.setFee(fee);

        // Set delivery date based on method
        if ("HOME_DELIVERY".equals(request.getDeliveryMethod())) {
            order.setDeliveryDate(LocalDateTime.now().plusDays(3));
        } else {
            order.setDeliveryDate(LocalDateTime.now().plusDays(1));
        }

        // Generate tracking number
        order.setTrackingNumber(generateTrackingNumber(order));

        // Save order
        CurrencyOrder savedOrder = currencyOrderRepository.save(order);

        // Withdraw funds from account (including fee)
        account.setBalance(account.getBalance() - totalUsd);
        accountRepository.save(account);

        return convertToDTO(savedOrder);
    }

    /**
     * Get orders for a user
     */
    public List<CurrencyOrderDTO> getUserOrders(Long userId) {
        List<CurrencyOrder> orders = currencyOrderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get order by ID
     */
    public CurrencyOrderDTO getOrderById(Long orderId) {
        CurrencyOrder order = currencyOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return convertToDTO(order);
    }

    /**
     * Cancel an order
     */
    @Transactional
    public CurrencyOrderDTO cancelOrder(Long orderId) {
        CurrencyOrder order = currencyOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus("CANCELLED");

        // Refund the amount to account
        Account account = order.getAccount();
        Double totalRefund = order.getFromAmount() + order.getFee();
        account.setBalance(account.getBalance() + totalRefund);
        accountRepository.save(account);

        CurrencyOrder updatedOrder = currencyOrderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    /**
     * Update order status (admin use)
     */
    @Transactional
    public CurrencyOrderDTO updateOrderStatus(Long orderId, String status) {
        CurrencyOrder order = currencyOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);
        
        if ("COMPLETED".equals(status)) {
            order.setDeliveryDate(LocalDateTime.now());
        }

        CurrencyOrder updatedOrder = currencyOrderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate tracking number
     */
    private String generateTrackingNumber(CurrencyOrder order) {
        String prefix = "FX";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return prefix + dateStr + randomStr;
    }

    /**
     * Convert CurrencyOrder entity to DTO
     */
    private CurrencyOrderDTO convertToDTO(CurrencyOrder order) {
        String maskedAccountNumber = "****" + order.getAccount().getAccountNumber()
            .substring(Math.max(0, order.getAccount().getAccountNumber().length() - 4));

        return new CurrencyOrderDTO(
            order.getId(),
            order.getUser().getId(),
            order.getAccount().getId(),
            order.getOrderNumber(),
            order.getFromCurrency(),
            order.getToCurrency(),
            order.getFromAmount(),
            order.getToAmount(),
            order.getExchangeRate(),
            order.getDeliveryMethod(),
            order.getDeliveryAddress(),
            order.getOrderDate(),
            order.getDeliveryDate(),
            order.getStatus(),
            order.getTrackingNumber(),
            order.getFee(),
            order.getNotes(),
            maskedAccountNumber,
            order.getUser().getFullName()
        );
    }
}
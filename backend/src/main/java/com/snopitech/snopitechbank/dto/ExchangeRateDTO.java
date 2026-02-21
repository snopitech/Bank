package com.snopitech.snopitechbank.dto;

import java.time.LocalDateTime;

public class ExchangeRateDTO {

    private String fromCurrency;
    private String toCurrency;
    private Double rate;
    private Double inverseRate;
    private LocalDateTime lastUpdated;
    private String symbol;
    private String countryName;

    // Constructors
    public ExchangeRateDTO() {}

    public ExchangeRateDTO(String fromCurrency, String toCurrency, Double rate, 
                          LocalDateTime lastUpdated, String symbol, String countryName) {
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.rate = rate;
        this.inverseRate = rate != null ? 1.0 / rate : null;
        this.lastUpdated = lastUpdated;
        this.symbol = symbol;
        this.countryName = countryName;
    }

    // Getters and Setters
    public String getFromCurrency() {
        return fromCurrency;
    }

    public void setFromCurrency(String fromCurrency) {
        this.fromCurrency = fromCurrency;
    }

    public String getToCurrency() {
        return toCurrency;
    }

    public void setToCurrency(String toCurrency) {
        this.toCurrency = toCurrency;
    }

    public Double getRate() {
        return rate;
    }

    public void setRate(Double rate) {
        this.rate = rate;
        this.inverseRate = rate != null ? 1.0 / rate : null;
    }

    public Double getInverseRate() {
        return inverseRate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    // Helper method to format rate for display
    public String getFormattedRate() {
        if (rate == null) return "N/A";
        return String.format("1 %s = %.4f %s", fromCurrency, rate, toCurrency);
    }

    public String getFormattedInverseRate() {
        if (inverseRate == null) return "N/A";
        return String.format("1 %s = %.4f %s", toCurrency, inverseRate, fromCurrency);
    }
}

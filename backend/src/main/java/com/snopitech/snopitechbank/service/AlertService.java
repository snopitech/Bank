package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Alert;
import com.snopitech.snopitechbank.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AlertService {

    // Create a new alert
    Alert createAlert(Alert alert);

    // Create alert with specific details
    Alert createAlert(User user, String type, String priority, String title, String message);

    // Get all alerts for a user
    List<Alert> getUserAlerts(Long userId);

    // Get unread alerts only
    List<Alert> getUnreadAlerts(Long userId);

    // Get unread count
    Long getUnreadCount(Long userId);

    // Mark single alert as read
    Alert markAsRead(Long alertId);

    // Mark single alert as unread
    Alert markAsUnread(Long alertId);

    // Mark all alerts as read for a user
    int markAllAsRead(Long userId);

    // Delete single alert
    void deleteAlert(Long alertId);

    // Delete multiple alerts
    void deleteAlerts(Long userId, List<Long> alertIds);

    // Delete all user alerts
    void deleteAllUserAlerts(Long userId);

    // Check if alert belongs to user
    boolean alertBelongsToUser(Long alertId, Long userId);

    // Get alert by ID
    Alert getAlertById(Long alertId);

    // AUTO-GENERATED ALERTS
    // These will be called from other services
    
    // Transaction alerts
    Alert createLargeTransactionAlert(User user, String accountNumber, Double amount, String transactionType);
    
    Alert createLowBalanceAlert(User user, String accountNumber, String accountType, Double balance);
    
    Alert createInternationalTransactionAlert(User user, String accountNumber, Double amount, String location);
    
    Alert createDepositReceivedAlert(User user, String accountNumber, Double amount);
    
    // Security alerts
    Alert createNewDeviceLoginAlert(User user, String deviceInfo, String location);
    
    Alert createPasswordChangedAlert(User user);
    
    Alert createFailedLoginAttemptAlert(User user, Integer attempts);
    
    Alert createEmailChangedAlert(User user, String newEmail);
    
    // Account alerts
    Alert createStatementAvailableAlert(User user, String accountNumber, String accountType, String month, String year);
    
    Alert createBillPaymentReminderAlert(User user, String accountNumber, Double amount, LocalDate dueDate);
    
    Alert createAccountUpdatedAlert(User user, String accountType, String changeDescription);
    
    // System alerts
    Alert createMaintenanceAlert(String title, String message, LocalDateTime startTime, LocalDateTime endTime);
    
    Alert createNewFeatureAlert(String featureName, String description, String actionUrl);
}
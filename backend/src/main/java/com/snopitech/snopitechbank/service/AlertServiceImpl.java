package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Alert;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.repository.AlertRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;



@Service
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    @SuppressWarnings("unused")
    private final UserRepository userRepository;

    public AlertServiceImpl(AlertRepository alertRepository, UserRepository userRepository) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    @Override
    public Alert createAlert(User user, String type, String priority, String title, String message) {
        Alert alert = new Alert(user, type, priority, title, message);
        
        // Set default icon and color based on type
        switch (type.toUpperCase()) {
            case "TRANSACTION":
                alert.setIcon("💰");
                alert.setColor("green");
                break;
            case "SECURITY":
                alert.setIcon("🔒");
                alert.setColor("red");
                break;
            case "ACCOUNT":
                alert.setIcon("🏦");
                alert.setColor("blue");
                break;
            case "NOTICE":
                alert.setIcon("📢");
                alert.setColor("purple");
                break;
            default:
                alert.setIcon("📌");
                alert.setColor("gray");
        }
        
        return alertRepository.save(alert);
    }

    @Override
    public List<Alert> getUserAlerts(Long userId) {
        return alertRepository.findByUserIdOrderByTimestampDesc(userId);
    }

   @Override
public List<Alert> getUnreadAlerts(Long userId) {
    return alertRepository.findByUserIdAndIsReadFalseOrderByTimestampDesc(userId);
    }

    @Override
    public Long getUnreadCount(Long userId) {
        return alertRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public Alert markAsRead(Long alertId) {
        Alert alert = getAlertById(alertId);
        alert.setRead(true);
        return alertRepository.save(alert);
    }

    @Override
    @Transactional
    public Alert markAsUnread(Long alertId) {
        Alert alert = getAlertById(alertId);
        alert.setRead(false);
        return alertRepository.save(alert);
    }

    @Override
    @Transactional
    public int markAllAsRead(Long userId) {
        return alertRepository.markAllAsRead(userId);
    }

    @Override
    @Transactional
    public void deleteAlert(Long alertId) {
        alertRepository.deleteById(alertId);
    }

    @Override
    @Transactional
    public void deleteAlerts(Long userId, List<Long> alertIds) {
        alertRepository.deleteByUserIdAndIdIn(userId, alertIds);
    }

    @Override
    @Transactional
    public void deleteAllUserAlerts(Long userId) {
        alertRepository.deleteByUserId(userId);
    }

    @Override
    public boolean alertBelongsToUser(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId).orElse(null);
        return alert != null && alert.getUser().getId().equals(userId);
    }

    @Override
    public Alert getAlertById(Long alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));
    }

    // ============== AUTO-GENERATED ALERTS ==============

    @Override
    public Alert createLargeTransactionAlert(User user, String accountNumber, Double amount, String transactionType) {
        String title = "Large " + transactionType + " Alert";
        String message = String.format("A %s of $%.2f was made from/to account ****%s", 
                transactionType.toLowerCase(), amount, 
                accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber);
        
        Alert alert = createAlert(user, "TRANSACTION", "HIGH", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("red");
        alert.setIcon("⚠️");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createLowBalanceAlert(User user, String accountNumber, String accountType, Double balance) {
        String title = "Low Balance Warning";
        String message = String.format("Your %s account (****%s) balance is below $100. Current balance: $%.2f",
                accountType,
                accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber,
                balance);
        
        Alert alert = createAlert(user, "ACCOUNT", "HIGH", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("orange");
        alert.setIcon("⚠️");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createInternationalTransactionAlert(User user, String accountNumber, Double amount, String location) {
        String title = "International Transaction";
        String message = String.format("A purchase of $%.2f was made in %s from account ****%s",
                amount, location,
                accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber);
        
        Alert alert = createAlert(user, "TRANSACTION", "HIGH", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("red");
        alert.setIcon("🌍");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createDepositReceivedAlert(User user, String accountNumber, Double amount) {
        String title = "Deposit Received";
        String message = String.format("A deposit of $%.2f was made to your account ****%s",
                amount,
                accountNumber.length() >= 4 ? accountNumber.substring(accountNumber.length() - 4) : accountNumber);
        
        Alert alert = createAlert(user, "TRANSACTION", "MEDIUM", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("green");
        alert.setIcon("💰");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createNewDeviceLoginAlert(User user, String deviceInfo, String location) {
        String title = "New Device Login Detected";
        String message = String.format("Your account was accessed from a new device%s%s",
                deviceInfo != null && !deviceInfo.isEmpty() ? " (" + deviceInfo + ")" : "",
                location != null && !location.isEmpty() ? " in " + location : "");
        
        Alert alert = createAlert(user, "SECURITY", "HIGH", title, message);
        alert.setColor("red");
        alert.setIcon("🔒");
        alert.setActionText("Review login");
        alert.setActionUrl("/security/devices");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createPasswordChangedAlert(User user) {
        String title = "Password Changed Successfully";
        String message = "Your password was updated on " + LocalDate.now().toString();
        
        Alert alert = createAlert(user, "SECURITY", "MEDIUM", title, message);
        alert.setColor("green");
        alert.setIcon("✅");
        alert.setRead(true); // Password changes are informational, auto-mark as read
        return alertRepository.save(alert);
    }

    @Override
    public Alert createFailedLoginAttemptAlert(User user, Integer attempts) {
        String title = "Failed Login Attempt" + (attempts > 1 ? "s" : "");
        String message = String.format("There %s been %d failed login attempt%s on your account.",
                attempts == 1 ? "has" : "have",
                attempts,
                attempts == 1 ? "" : "s");
        
        Alert alert = createAlert(user, "SECURITY", "HIGH", title, message);
        alert.setColor("red");
        alert.setIcon("⚠️");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createEmailChangedAlert(User user, String newEmail) {
        String title = "Email Address Changed";
        String message = String.format("Your email address was updated to %s", newEmail);
        
        Alert alert = createAlert(user, "SECURITY", "MEDIUM", title, message);
        alert.setColor("blue");
        alert.setIcon("📧");
        alert.setRead(true);
        return alertRepository.save(alert);
    }

    @Override
    public Alert createStatementAvailableAlert(User user, String accountNumber, String accountType, String month, String year) {
        String title = "Monthly Statement Available";
        String message = String.format("Your %s %s account statement for %s %s is now available for download.",
                month, accountType.toLowerCase(), month, year);
        
        Alert alert = createAlert(user, "ACCOUNT", "MEDIUM", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("blue");
        alert.setIcon("📄");
        alert.setActionText("View statement");
        alert.setActionUrl("/accounts/statements?month=" + month + "&year=" + year);
        return alertRepository.save(alert);
    }

    @Override
    public Alert createBillPaymentReminderAlert(User user, String accountNumber, Double amount, LocalDate dueDate) {
        String title = "Bill Payment Reminder";
        String message = String.format("Your payment of $%.2f is due in %d days.",
                amount, LocalDate.now().until(dueDate).getDays());
        
        Alert alert = createAlert(user, "ACCOUNT", "MEDIUM", title, message);
        alert.setAccountNumber(accountNumber);
        alert.setColor("blue");
        alert.setIcon("⏰");
        alert.setActionText("Pay now");
        alert.setActionUrl("/pay-bills");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createAccountUpdatedAlert(User user, String accountType, String changeDescription) {
        String title = accountType + " Account Updated";
        String message = changeDescription;
        
        Alert alert = createAlert(user, "ACCOUNT", "LOW", title, message);
        alert.setColor("green");
        alert.setIcon("✅");
        return alertRepository.save(alert);
    }

    @Override
    public Alert createMaintenanceAlert(String title, String message, LocalDateTime startTime, LocalDateTime endTime) {
        // This is a system-wide alert, not tied to a specific user
        // You might want to create this for all users or store it differently
        Alert alert = new Alert();
        alert.setType("NOTICE");
        alert.setPriority("MEDIUM");
        alert.setTitle(title);
        alert.setMessage(message + String.format(" (Scheduled: %s - %s)", 
                startTime.toLocalTime().toString(), 
                endTime.toLocalTime().toString()));
        alert.setTimestamp(LocalDateTime.now());
        alert.setColor("purple");
        alert.setIcon("⚙️");
        alert.setRead(false);
        
        return alertRepository.save(alert);
    }

    @Override
    public Alert createNewFeatureAlert(String featureName, String description, String actionUrl) {
        // System-wide feature announcement
        Alert alert = new Alert();
        alert.setType("NOTICE");
        alert.setPriority("LOW");
        alert.setTitle("New Feature: " + featureName);
        alert.setMessage(description);
        alert.setTimestamp(LocalDateTime.now());
        alert.setColor("purple");
        alert.setIcon("✨");
        alert.setActionText("Learn more");
        alert.setActionUrl(actionUrl);
        alert.setRead(false);
        
        return alertRepository.save(alert);
    }
}
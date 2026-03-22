package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.model.Alert;
import com.snopitech.snopitechbank.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    // ⭐ GET ALL ALERTS FOR A USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAlerts(@PathVariable Long userId) {
        try {
            List<Alert> alerts = alertService.getUserAlerts(userId);
            return ResponseEntity.ok(alerts);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ GET UNREAD COUNT
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            Long count = alertService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ GET UNREAD ALERTS ONLY
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadAlerts(@PathVariable Long userId) {
        try {
            List<Alert> alerts = alertService.getUnreadAlerts(userId);
            return ResponseEntity.ok(alerts);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ MARK ALERT AS READ
    @PutMapping("/{alertId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long alertId) {
        try {
            Alert alert = alertService.markAsRead(alertId);
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ MARK ALERT AS UNREAD
    @PutMapping("/{alertId}/unread")
    public ResponseEntity<?> markAsUnread(@PathVariable Long alertId) {
        try {
            Alert alert = alertService.markAsUnread(alertId);
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ MARK ALL ALERTS AS READ FOR A USER
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        try {
            int count = alertService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of(
                "message", "All alerts marked as read",
                "count", count
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ DELETE SINGLE ALERT
    @DeleteMapping("/{alertId}")
    public ResponseEntity<?> deleteAlert(@PathVariable Long alertId) {
        try {
            alertService.deleteAlert(alertId);
            return ResponseEntity.ok(Map.of(
                "message", "Alert deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ DELETE MULTIPLE ALERTS
    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteAlerts(
            @RequestParam Long userId,
            @RequestBody List<Long> alertIds
    ) {
        try {
            alertService.deleteAlerts(userId, alertIds);
            return ResponseEntity.ok(Map.of(
                "message", alertIds.size() + " alerts deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ DELETE ALL USER ALERTS
    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<?> deleteAllUserAlerts(@PathVariable Long userId) {
        try {
            alertService.deleteAllUserAlerts(userId);
            return ResponseEntity.ok(Map.of(
                "message", "All alerts deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ GET SINGLE ALERT BY ID
    @GetMapping("/{alertId}")
    public ResponseEntity<?> getAlertById(@PathVariable Long alertId) {
        try {
            Alert alert = alertService.getAlertById(alertId);
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐ VERIFY ALERT BELONGS TO USER (helper endpoint)
    @GetMapping("/{alertId}/verify-user/{userId}")
    public ResponseEntity<?> verifyAlertOwnership(
            @PathVariable Long alertId,
            @PathVariable Long userId
    ) {
        boolean belongs = alertService.alertBelongsToUser(alertId, userId);
        return ResponseEntity.ok(Map.of("belongsToUser", belongs));
    }
}
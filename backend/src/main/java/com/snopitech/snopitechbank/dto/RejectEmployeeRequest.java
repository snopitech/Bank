package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectEmployeeRequest {

    @NotBlank(message = "Admin username is required")
    @Size(max = 50, message = "Admin username must be less than 50 characters")
    private String rejectedBy;

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Rejection reason must be less than 500 characters")
    private String reason;

    private boolean sendNotificationEmail = true;

    // Getters and Setters
    public String getRejectedBy() {
        return rejectedBy;
    }

    public void setRejectedBy(String rejectedBy) {
        this.rejectedBy = rejectedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public boolean isSendNotificationEmail() {
        return sendNotificationEmail;
    }

    public void setSendNotificationEmail(boolean sendNotificationEmail) {
        this.sendNotificationEmail = sendNotificationEmail;
    }
}
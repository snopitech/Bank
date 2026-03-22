package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateCardStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, FROZEN, BLOCKED, etc.

    private String reason; // Optional reason for status change

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

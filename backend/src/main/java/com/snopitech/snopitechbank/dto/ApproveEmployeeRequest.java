package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ApproveEmployeeRequest {

    @NotBlank(message = "Admin username is required")
    @Size(max = 50, message = "Admin username must be less than 50 characters")
    private String approvedBy;

    @Size(max = 500, message = "Notes must be less than 500 characters")
    private String notes;

    private boolean sendWelcomeEmail = true;

    // Optional: Custom password (if not auto-generated)
    private String customPassword;

    // Getters and Setters
    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isSendWelcomeEmail() {
        return sendWelcomeEmail;
    }

    public void setSendWelcomeEmail(boolean sendWelcomeEmail) {
        this.sendWelcomeEmail = sendWelcomeEmail;
    }

    public String getCustomPassword() {
        return customPassword;
    }

    public void setCustomPassword(String customPassword) {
        this.customPassword = customPassword;
    }
}
package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdatePinRequest {

    @NotBlank(message = "Current PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    @Pattern(regexp = "^[0-9]{4}$", message = "PIN must contain only digits")
    private String currentPin;

    @NotBlank(message = "New PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    @Pattern(regexp = "^[0-9]{4}$", message = "PIN must contain only digits")
    private String newPin;

    @NotBlank(message = "Confirm PIN is required")
    @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
    @Pattern(regexp = "^[0-9]{4}$", message = "PIN must contain only digits")
    private String confirmPin;

    // Getters and Setters
    public String getCurrentPin() {
        return currentPin;
    }

    public void setCurrentPin(String currentPin) {
        this.currentPin = currentPin;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }

    public String getConfirmPin() {
        return confirmPin;
    }

    public void setConfirmPin(String confirmPin) {
        this.confirmPin = confirmPin;
    }

    // Helper method to validate if new PIN matches confirm PIN
    public boolean isNewPinMatching() {
        return newPin != null && newPin.equals(confirmPin);
    }
}
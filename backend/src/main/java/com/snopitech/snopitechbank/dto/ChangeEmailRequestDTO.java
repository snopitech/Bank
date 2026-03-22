package com.snopitech.snopitechbank.dto;

public class ChangeEmailRequestDTO {
    private String currentEmail;
    private String newEmail;

    public ChangeEmailRequestDTO() {}

    // Getters and Setters
    public String getCurrentEmail() {
        return currentEmail;
    }

    public void setCurrentEmail(String currentEmail) {
        this.currentEmail = currentEmail;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }
}

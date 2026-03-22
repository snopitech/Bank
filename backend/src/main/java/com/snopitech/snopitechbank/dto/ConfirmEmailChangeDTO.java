package com.snopitech.snopitechbank.dto;

public class ConfirmEmailChangeDTO {
    private String token;
    private String newEmail;

    public ConfirmEmailChangeDTO() {}

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }
}

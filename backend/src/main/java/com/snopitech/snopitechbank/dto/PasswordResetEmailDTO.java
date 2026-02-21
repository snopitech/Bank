package com.snopitech.snopitechbank.dto;

public class PasswordResetEmailDTO {

    private String email;
    private String userName;
    private String resetLink;

    public PasswordResetEmailDTO() {}

    public PasswordResetEmailDTO(String email, String userName, String resetLink) {
        this.email = email;
        this.userName = userName;
        this.resetLink = resetLink;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getResetLink() {
        return resetLink;
    }

    public void setResetLink(String resetLink) {
        this.resetLink = resetLink;
    }
}
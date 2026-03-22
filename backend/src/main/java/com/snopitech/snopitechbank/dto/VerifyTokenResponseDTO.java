package com.snopitech.snopitechbank.dto;

public class VerifyTokenResponseDTO {

    private boolean valid;
    private String message;
    private String email;

    public VerifyTokenResponseDTO() {}

    public VerifyTokenResponseDTO(boolean valid, String message, String email) {
        this.valid = valid;
        this.message = message;
        this.email = email;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
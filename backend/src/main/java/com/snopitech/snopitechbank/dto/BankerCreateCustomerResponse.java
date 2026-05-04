package com.snopitech.snopitechbank.dto;

public class BankerCreateCustomerResponse {
    private boolean success;
    private String message;
    private Long customerId;
    private String firstName;
    private String lastName;
    private String email;
    
    public BankerCreateCustomerResponse() {}
    
    public BankerCreateCustomerResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public BankerCreateCustomerResponse(boolean success, String message, Long customerId, 
                                         String firstName, String lastName, String email) {
        this.success = success;
        this.message = message;
        this.customerId = customerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
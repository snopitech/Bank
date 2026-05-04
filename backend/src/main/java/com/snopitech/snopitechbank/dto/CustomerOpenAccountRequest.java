package com.snopitech.snopitechbank.dto;

public class CustomerOpenAccountRequest {
    private Long customerId;
    private String accountType;
    
    public CustomerOpenAccountRequest() {}
    
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public String getAccountType() {
        return accountType;
    }
    
    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
    
    public boolean isValid() {
        return customerId != null && 
               accountType != null && 
               (accountType.equals("CHECKING") || accountType.equals("SAVINGS"));
    }
}

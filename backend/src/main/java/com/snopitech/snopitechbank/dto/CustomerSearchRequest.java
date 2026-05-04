package com.snopitech.snopitechbank.dto;

public class CustomerSearchRequest {

    private Long employeeId;
    private String searchEmail;
    private String searchPassport;

    // Constructors
    public CustomerSearchRequest() {}

    public CustomerSearchRequest(Long employeeId, String searchEmail, String searchPassport) {
        this.employeeId = employeeId;
        this.searchEmail = searchEmail;
        this.searchPassport = searchPassport;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getSearchEmail() {
        return searchEmail;
    }

    public void setSearchEmail(String searchEmail) {
        this.searchEmail = searchEmail;
    }

    public String getSearchPassport() {
        return searchPassport;
    }

    public void setSearchPassport(String searchPassport) {
        this.searchPassport = searchPassport;
    }

    // Validation helper
    public boolean hasSearchCriteria() {
        return (searchEmail != null && !searchEmail.trim().isEmpty()) ||
               (searchPassport != null && !searchPassport.trim().isEmpty());
    }
}

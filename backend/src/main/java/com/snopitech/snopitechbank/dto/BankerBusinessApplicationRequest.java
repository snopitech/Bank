package com.snopitech.snopitechbank.dto;

public class BankerBusinessApplicationRequest {

    private Long employeeId;
    private Long customerId;
    private String businessName;
    private String businessType;  // LLC, CORPORATION, SOLE_PROPRIETORSHIP, PARTNERSHIP, NONPROFIT
    private String businessAddress;
    private String ein;  // Employer Identification Number (Tax ID)
    private String businessDocuments;  // JSON string or comma-separated document URLs

    // Constructors
    public BankerBusinessApplicationRequest() {}

    public BankerBusinessApplicationRequest(Long employeeId, Long customerId, 
                                             String businessName, String businessType,
                                             String businessAddress, String ein,
                                             String businessDocuments) {
        this.employeeId = employeeId;
        this.customerId = customerId;
        this.businessName = businessName;
        this.businessType = businessType;
        this.businessAddress = businessAddress;
        this.ein = ein;
        this.businessDocuments = businessDocuments;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getEin() {
        return ein;
    }

    public void setEin(String ein) {
        this.ein = ein;
    }

    public String getBusinessDocuments() {
        return businessDocuments;
    }

    public void setBusinessDocuments(String businessDocuments) {
        this.businessDocuments = businessDocuments;
    }

    // Validation helper
    public boolean isValid() {
        if (employeeId == null || customerId == null) {
            return false;
        }
        if (businessName == null || businessName.trim().isEmpty()) {
            return false;
        }
        if (businessType == null || businessType.trim().isEmpty()) {
            return false;
        }
        if (businessAddress == null || businessAddress.trim().isEmpty()) {
            return false;
        }
        if (ein == null || ein.trim().isEmpty()) {
            return false;
        }
        return true;
    }
}

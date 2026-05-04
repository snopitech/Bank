package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.*;

public interface BankerAccountService {

    CustomerSearchResponse searchCustomer(CustomerSearchRequest request);

    BankerOpenAccountResponse openInstantAccount(BankerOpenAccountRequest request);

    BankerOpenAccountResponse submitBusinessApplication(BankerBusinessApplicationRequest request);

    boolean verifyEmployeeExists(Long employeeId);

    BankerCreateCustomerResponse createCustomer(BankerCreateCustomerRequest request);
    
    CustomerOpenAccountResponse customerOpenAccount(CustomerOpenAccountRequest request);
}
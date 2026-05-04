package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.*;
import com.snopitech.snopitechbank.service.BankerAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/banker")
public class BankerAccountController {

    private final BankerAccountService bankerAccountService;

    public BankerAccountController(BankerAccountService bankerAccountService) {
        this.bankerAccountService = bankerAccountService;
    }

    @PostMapping("/customers/search")
    public ResponseEntity<?> searchCustomer(@RequestBody CustomerSearchRequest request) {
        try {
            CustomerSearchResponse response = bankerAccountService.searchCustomer(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/customers/create")
    public ResponseEntity<?> createCustomer(@RequestBody BankerCreateCustomerRequest request) {
        try {
            BankerCreateCustomerResponse response = bankerAccountService.createCustomer(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", response.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/accounts/open-instant")
    public ResponseEntity<?> openInstantAccount(@RequestBody BankerOpenAccountRequest request) {
        try {
            BankerOpenAccountResponse response = bankerAccountService.openInstantAccount(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", response.getMessage()));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/business-applications/submit")
    public ResponseEntity<?> submitBusinessApplication(@RequestBody BankerBusinessApplicationRequest request) {
        try {
            BankerOpenAccountResponse response = bankerAccountService.submitBusinessApplication(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", response.getMessage()));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/customer/accounts/open")
    public ResponseEntity<?> customerOpenAccount(@RequestBody CustomerOpenAccountRequest request) {
        try {
            CustomerOpenAccountResponse response = bankerAccountService.customerOpenAccount(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", response.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
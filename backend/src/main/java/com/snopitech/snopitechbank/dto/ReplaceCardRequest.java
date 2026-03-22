package com.snopitech.snopitechbank.dto;

import jakarta.validation.constraints.NotBlank;

public class ReplaceCardRequest {

    @NotBlank(message = "Replacement reason is required")
    private String reason; // LOST, STOLEN, DAMAGED, EXPIRED

    private String deliveryAddress; // If different from account address

    private Boolean expediteShipping = false;

    // Getters and Setters
    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public Boolean getExpediteShipping() {
        return expediteShipping;
    }

    public void setExpediteShipping(Boolean expediteShipping) {
        this.expediteShipping = expediteShipping;
    }
}

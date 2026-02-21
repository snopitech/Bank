package com.snopitech.snopitechbank.dto;

public class CardDesignRequest {

    private String designColor; // Hex color code or predefined color name

    private String designImage; // URL or reference to uploaded image

    private Boolean useDefaultImage = false;

    // Getters and Setters
    public String getDesignColor() {
        return designColor;
    }

    public void setDesignColor(String designColor) {
        this.designColor = designColor;
    }

    public String getDesignImage() {
        return designImage;
    }

    public void setDesignImage(String designImage) {
        this.designImage = designImage;
    }

    public Boolean getUseDefaultImage() {
        return useDefaultImage;
    }

    public void setUseDefaultImage(Boolean useDefaultImage) {
        this.useDefaultImage = useDefaultImage;
    }

    // Validate that at least one design option is provided
    public boolean hasDesignChanges() {
        return (designColor != null && !designColor.isEmpty()) ||
               (designImage != null && !designImage.isEmpty()) ||
               useDefaultImage;
    }
}
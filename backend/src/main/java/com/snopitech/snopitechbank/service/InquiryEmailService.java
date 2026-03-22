package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.model.Inquiry;

public interface InquiryEmailService {
    
    /**
     * Send auto-response to user who submitted inquiry
     */
    void sendAutoResponse(Inquiry inquiry);
    
    /**
     * Send notification to admin (snopitech@gmail.com)
     */
    void sendAdminNotification(Inquiry inquiry);
    
    /**
     * Send manual response from admin to user
     */
    void sendManualResponse(Inquiry inquiry, String adminMessage, String adminName);
}

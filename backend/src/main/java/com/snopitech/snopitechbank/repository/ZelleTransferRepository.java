package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.ZelleTransfer;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ZelleTransferRepository extends JpaRepository<ZelleTransfer, Long> {
    
    // Find all transfers for a user (sent or received)
    List<ZelleTransfer> findByFromUserOrderByCreatedAtDesc(User user);
    
    // Find transfers by status
    List<ZelleTransfer> findByFromUserAndStatusOrderByCreatedAtDesc(User user, String status);
    
    // Find recent transfers (last 30 days)
    List<ZelleTransfer> findByFromUserAndCreatedAtAfterOrderByCreatedAtDesc(User user, LocalDateTime date);
    
    // Find by reference number
    ZelleTransfer findByReference(String reference);
    
    // Find transfers to a specific email/phone
    List<ZelleTransfer> findByFromUserAndRecipientEmailOrderByCreatedAtDesc(User user, String email);
    List<ZelleTransfer> findByFromUserAndRecipientPhoneOrderByCreatedAtDesc(User user, String phone);
}
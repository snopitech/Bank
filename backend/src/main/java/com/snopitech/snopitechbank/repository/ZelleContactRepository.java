package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.ZelleContact;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZelleContactRepository extends JpaRepository<ZelleContact, Long> {
    
    // Find all contacts for a user, ordered by most used
    List<ZelleContact> findByUserOrderByTransferCountDescLastUsedDesc(User user);
    
    // Find specific contact by email
    Optional<ZelleContact> findByUserAndContactEmail(User user, String email);
    
    // Find specific contact by phone
    Optional<ZelleContact> findByUserAndContactPhone(User user, String phone);
    
    // Search contacts by name (for autocomplete)
    List<ZelleContact> findByUserAndContactNameContainingIgnoreCaseOrderByTransferCountDesc(User user, String name);
    
    // Check if contact exists
    boolean existsByUserAndContactEmail(User user, String email);
    boolean existsByUserAndContactPhone(User user, String phone);
}

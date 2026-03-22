package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find user by email WITH ACCOUNTS (eager loading)
    @EntityGraph(attributePaths = {"accounts"})
    User findByEmail(String email);
    
    // Find by customer ID
    User findByCustomerId(String customerId);

    // ⭐ SEARCH USERS BY NAME
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    
    // Override findById to load accounts eagerly
    @EntityGraph(attributePaths = {"accounts"})
    @Override
    Optional<User> findById(Long id);
    
    // Helper method
    default boolean emailExists(String email) {
        return existsByEmail(email);
    }
    
    // Find user by reset token
    Optional<User> findByResetToken(String resetToken);
    
    // Find user by email (case insensitive)
    Optional<User> findByEmailIgnoreCase(String email);
    
    // ⭐ Find user by sessionId
    Optional<User> findBySessionId(String sessionId);

    // ⭐ Find the last customer ID used
    @Query("SELECT u.customerId FROM User u ORDER BY u.id DESC LIMIT 1")
    String findLastCustomerId();
    
    // ⭐ Find user by phone number (ADD THIS)
    Optional<User> findByPhone(String phone);
}
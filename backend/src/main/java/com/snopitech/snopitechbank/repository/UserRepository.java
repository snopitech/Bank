package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
    
    // Override findById to load accounts eagerly
    @EntityGraph(attributePaths = {"accounts"})
    @Override
    Optional<User> findById(Long id);
    
    // Helper method
    default boolean emailExists(String email) {
        return existsByEmail(email);
    }
    
    // ⭐ NEW METHOD FOR PASSWORD RESET (ADDED SAFELY)
    // Find user by reset token
    Optional<User> findByResetToken(String resetToken);
}
package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.ZelleEnrollment;
import com.snopitech.snopitechbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZelleEnrollmentRepository extends JpaRepository<ZelleEnrollment, Long> {
    
    // Find enrollment by user
    Optional<ZelleEnrollment> findByUserAndActiveTrue(User user);
    
    // Find by email
    Optional<ZelleEnrollment> findByEmail(String email);
    
    // Find by phone
    Optional<ZelleEnrollment> findByPhone(String phone);
    
    // Check if email already enrolled
    boolean existsByEmail(String email);
    
    // Check if phone already enrolled
    boolean existsByPhone(String phone);
    
    // Find all active enrollments for a user
    List<ZelleEnrollment> findByUserAndActiveTrueOrderByEnrolledAtDesc(User user);
}
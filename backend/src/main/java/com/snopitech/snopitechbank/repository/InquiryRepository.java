package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    // Find by reference number
    Optional<Inquiry> findByReferenceNumber(String referenceNumber);
    
    // Find by user ID
    List<Inquiry> findByUserId(Long userId);
    
    // Find by email
    List<Inquiry> findByEmail(String email);
    
    // Find by status
    List<Inquiry> findByStatus(String status);
    
    // Find by priority
    List<Inquiry> findByPriority(String priority);
    
    // Find by category
    List<Inquiry> findByCategory(String category);
    
    // Find open inquiries
    List<Inquiry> findByStatusIn(List<String> statuses);
    
    // Find by date range
    List<Inquiry> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Count by status
    long countByStatus(String status);
    
    // Count by priority
    long countByPriority(String priority);
    
    // Find latest inquiries
    List<Inquiry> findTop10ByOrderByCreatedAtDesc();
    
    // Custom query for search
    @Query("SELECT i FROM Inquiry i WHERE " +
           "LOWER(i.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.subject) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.message) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Inquiry> searchInquiries(@Param("query") String query);
}
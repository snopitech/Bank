package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
    
    // Find all documents for a specific claim
    List<ClaimDocument> findByClaimId(Long claimId);
    
    // Find documents by file type
    List<ClaimDocument> findByFileType(String fileType);
    
    // Delete all documents for a claim (used when claim is deleted)
    void deleteByClaimId(Long claimId);
    
    // Count documents per claim
    long countByClaimId(Long claimId);
}
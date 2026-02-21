package com.snopitech.snopitechbank.service;

import com.snopitech.snopitechbank.dto.ClaimDTO;
import com.snopitech.snopitechbank.dto.ClaimDocumentDTO;
import com.snopitech.snopitechbank.dto.CreateClaimRequest;
import com.snopitech.snopitechbank.dto.UpdateClaimStatusRequest;
import com.snopitech.snopitechbank.model.Claim;
import com.snopitech.snopitechbank.model.ClaimDocument;
import com.snopitech.snopitechbank.model.User;
import com.snopitech.snopitechbank.model.Account;
import com.snopitech.snopitechbank.repository.ClaimRepository;
import com.snopitech.snopitechbank.repository.ClaimDocumentRepository;
import com.snopitech.snopitechbank.repository.UserRepository;
import com.snopitech.snopitechbank.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimDocumentRepository claimDocumentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    // Generate unique claim number
    private String generateClaimNumber() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        return "CLM-" + timestamp + "-" + (int)(Math.random() * 10000);
    }

    // Get all claims for a user
    public List<ClaimDTO> getClaimsByUser(Long userId) {
        List<Claim> claims = claimRepository.findByUserId(userId);
        return claims.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get claim by ID
    public ClaimDTO getClaimById(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));
        return convertToDTO(claim);
    }

    // File new claim
    @Transactional
    public ClaimDTO createClaim(CreateClaimRequest request) {
        // Verify user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Verify account exists if provided
        Account account = null;
        if (request.getAccountId() != null) {
            account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found with id: " + request.getAccountId()));
        }

        // Create new claim
        Claim claim = new Claim();
        claim.setUser(user);
        claim.setAccount(account);
        claim.setClaimNumber(generateClaimNumber());
        claim.setClaimType(request.getClaimType());
        claim.setPriority(request.getPriority());
        claim.setSubject(request.getSubject());
        claim.setDescription(request.getDescription());
        claim.setDisputedAmount(request.getDisputedAmount());
        claim.setTransactionDate(request.getTransactionDate());
        claim.setTransactionId(request.getTransactionId());
        claim.setMerchantName(request.getMerchantName());
        claim.setStatus("SUBMITTED");
        claim.setFiledDate(LocalDateTime.now());
        claim.setLastUpdatedDate(LocalDateTime.now());

        Claim savedClaim = claimRepository.save(claim);
        return convertToDTO(savedClaim);
    }

    // Update claim status
    @Transactional
    public ClaimDTO updateClaimStatus(Long claimId, UpdateClaimStatusRequest request) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));

        claim.setStatus(request.getStatus());
        claim.setResolution(request.getResolution());
        claim.setLastUpdatedDate(LocalDateTime.now());

        // If status is RESOLVED or CLOSED, set resolved date
        if ("RESOLVED".equals(request.getStatus()) || "CLOSED".equals(request.getStatus())) {
            claim.setResolvedDate(LocalDateTime.now());
        }

        Claim updatedClaim = claimRepository.save(claim);
        return convertToDTO(updatedClaim);
    }

    // Upload document for claim
    @Transactional
    public ClaimDocumentDTO uploadDocument(Long claimId, MultipartFile file, String description) throws IOException {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Check file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }

        // Create document
        ClaimDocument document = new ClaimDocument();
        document.setClaim(claim);
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setFileData(file.getBytes());
        document.setDescription(description);

        ClaimDocument savedDocument = claimDocumentRepository.save(document);
        return convertToDocumentDTO(savedDocument);
    }

    // Get documents for a claim
    public List<ClaimDocumentDTO> getClaimDocuments(Long claimId) {
        List<ClaimDocument> documents = claimDocumentRepository.findByClaimId(claimId);
        return documents.stream()
                .map(this::convertToDocumentDTO)
                .collect(Collectors.toList());
    }

    // Download document (returns file data)
    public ClaimDocument downloadDocument(Long documentId) {
        return claimDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
    }

    // Delete document
    @Transactional
    public void deleteDocument(Long documentId) {
        ClaimDocument document = claimDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
        claimDocumentRepository.delete(document);
    }

    // Helper method to convert Claim to DTO
    private ClaimDTO convertToDTO(Claim claim) {
        List<ClaimDocumentDTO> documentDTOs = claim.getDocuments().stream()
                .map(this::convertToDocumentDTO)
                .collect(Collectors.toList());

        return new ClaimDTO(
            claim.getId(),
            claim.getUser().getId(),
            claim.getAccount() != null ? claim.getAccount().getId() : null,
            claim.getClaimNumber(),
            claim.getClaimType(),
            claim.getStatus(),
            claim.getPriority(),
            claim.getSubject(),
            claim.getDescription(),
            claim.getDisputedAmount(),
            claim.getTransactionDate(),
            claim.getTransactionId(),
            claim.getMerchantName(),
            claim.getResolution(),
            claim.getFiledDate(),
            claim.getLastUpdatedDate(),
            claim.getResolvedDate(),
            documentDTOs
        );
    }

    // Helper method to convert ClaimDocument to DTO (without file data)
    private ClaimDocumentDTO convertToDocumentDTO(ClaimDocument document) {
        return new ClaimDocumentDTO(
            document.getId(),
            document.getClaim().getId(),
            document.getFileName(),
            document.getFileType(),
            document.getFileSize(),
            document.getUploadDate(),
            document.getDescription()
        );
    }
}

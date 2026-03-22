package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.dto.ClaimDTO;
import com.snopitech.snopitechbank.dto.ClaimDocumentDTO;
import com.snopitech.snopitechbank.dto.CreateClaimRequest;
import com.snopitech.snopitechbank.dto.UpdateClaimStatusRequest;
import com.snopitech.snopitechbank.model.ClaimDocument;
import com.snopitech.snopitechbank.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    // GET /api/claims/user/{userId} - List all claims for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClaimDTO>> getUserClaims(@PathVariable Long userId) {
        List<ClaimDTO> claims = claimService.getClaimsByUser(userId);
        return ResponseEntity.ok(claims);
    }

    // GET /api/claims/{claimId} - Get claim details
    @GetMapping("/{claimId}")
    public ResponseEntity<ClaimDTO> getClaimById(@PathVariable Long claimId) {
        ClaimDTO claim = claimService.getClaimById(claimId);
        return ResponseEntity.ok(claim);
    }

    // POST /api/claims - File new claim
    @PostMapping
    public ResponseEntity<ClaimDTO> createClaim(@Valid @RequestBody CreateClaimRequest request) {
        ClaimDTO createdClaim = claimService.createClaim(request);
        return new ResponseEntity<>(createdClaim, HttpStatus.CREATED);
    }

    // PATCH /api/claims/{claimId}/status - Update claim status
    @PatchMapping("/{claimId}/status")
    public ResponseEntity<ClaimDTO> updateClaimStatus(
            @PathVariable Long claimId,
            @Valid @RequestBody UpdateClaimStatusRequest request) {
        ClaimDTO updatedClaim = claimService.updateClaimStatus(claimId, request);
        return ResponseEntity.ok(updatedClaim);
    }

    // POST /api/claims/{claimId}/documents - Upload supporting documents
    @PostMapping(value = "/{claimId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClaimDocumentDTO> uploadDocument(
            @PathVariable Long claimId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) throws IOException {
        ClaimDocumentDTO document = claimService.uploadDocument(claimId, file, description);
        return new ResponseEntity<>(document, HttpStatus.CREATED);
    }

    // GET /api/claims/{claimId}/documents - Get all documents for a claim
    @GetMapping("/{claimId}/documents")
    public ResponseEntity<List<ClaimDocumentDTO>> getClaimDocuments(@PathVariable Long claimId) {
        List<ClaimDocumentDTO> documents = claimService.getClaimDocuments(claimId);
        return ResponseEntity.ok(documents);
    }

    // GET /api/claims/documents/{documentId}/download - Download a document
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        ClaimDocument document = claimService.downloadDocument(documentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getFileType()));
        headers.setContentDispositionFormData("attachment", document.getFileName());
        headers.setContentLength(document.getFileSize());
        
        return new ResponseEntity<>(document.getFileData(), headers, HttpStatus.OK);
    }

    // DELETE /api/claims/documents/{documentId} - Delete a document
    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        claimService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}

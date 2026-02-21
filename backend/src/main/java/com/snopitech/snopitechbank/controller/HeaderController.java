package com.snopitech.snopitechbank.controller;

import com.snopitech.snopitechbank.service.HeaderService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/header")
public class HeaderController {
    
    private final HeaderService headerService;
    
    public HeaderController(HeaderService headerService) {
        this.headerService = headerService;
    }
    
    // Keep the test endpoint for now
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Header API is working!");
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }
    
    // REAL STATS ENDPOINT
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getHeaderStats(
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        // TEMPORARY: Hardcode userId = 1 for now
        // You'll replace this with real authentication later
        Long currentUserId = 1L; // Hardcoded for development
        
        // Get stats from service
        Map<String, Object> stats = headerService.getUserStats(currentUserId);
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", stats);
        response.put("userId", currentUserId);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
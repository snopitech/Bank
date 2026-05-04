package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.User;
import com.snopitech.teams_collaboration_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        @SuppressWarnings("null")
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        
        String status = request.get("status");
        user.setStatus(status);
        if ("ONLINE".equals(status)) {
            user.setLastActive(LocalDateTime.now());
        }
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", status);
        return ResponseEntity.ok(response);
    }
}
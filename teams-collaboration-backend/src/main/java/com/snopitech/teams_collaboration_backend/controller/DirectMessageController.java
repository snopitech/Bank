package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.DirectMessage;
import com.snopitech.teams_collaboration_backend.model.User;
import com.snopitech.teams_collaboration_backend.repository.DirectMessageRepository;
import com.snopitech.teams_collaboration_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/direct")
public class DirectMessageController {

    @Autowired
    private DirectMessageRepository directMessageRepository;

    @Autowired
    private UserRepository userRepository;

    // Send a direct message (same pattern as channel message)
    @PostMapping("/send")
    public ResponseEntity<?> sendDirectMessage(@RequestBody Map<String, Object> request) {
        try {
            Long senderId = Long.valueOf(request.get("senderId").toString());
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String content = (String) request.get("content");

            DirectMessage message = new DirectMessage();
            message.setSenderId(senderId);
            message.setReceiverId(receiverId);
            message.setContent(content);
            message.setCreatedAt(LocalDateTime.now());
            message.setIsEdited(false);
            message.setIsDeleted(false);

            DirectMessage savedMessage = directMessageRepository.save(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "DM sent");
            response.put("messageId", savedMessage.getId());
            response.put("content", savedMessage.getContent());
            response.put("createdAt", savedMessage.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // EDIT direct message (EXACT same pattern as channel message)
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<?> editDirectMessage(@PathVariable Long messageId, @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String newContent = (String) request.get("content");

            @SuppressWarnings("null")
            DirectMessage message = directMessageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
            }

            if (!message.getSenderId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You can only edit your own messages"));
            }

            if (Boolean.TRUE.equals(message.getIsDeleted())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot edit a deleted message"));
            }

            message.setContent(newContent);
            message.setIsEdited(true);
            message.setUpdatedAt(LocalDateTime.now());
            DirectMessage savedMessage = directMessageRepository.save(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messageId", savedMessage.getId());
            response.put("content", savedMessage.getContent());
            response.put("isEdited", savedMessage.getIsEdited());
            response.put("updatedAt", savedMessage.getUpdatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE direct message (EXACT same pattern as channel message)
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteDirectMessage(@PathVariable Long messageId, @RequestParam Long userId) {
        try {
            @SuppressWarnings("null")
            DirectMessage message = directMessageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
            }

            if (!message.getSenderId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You can only delete your own messages"));
            }

            if (Boolean.TRUE.equals(message.getIsDeleted())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message already deleted"));
            }

            message.setIsDeleted(true);
            message.setContent("[Message deleted]");
            message.setUpdatedAt(LocalDateTime.now());
            directMessageRepository.save(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messageId", messageId);
            response.put("message", "Message deleted");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get conversation between two users (you already have this)
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId1, @PathVariable Long userId2) {
        List<DirectMessage> messages = directMessageRepository
            .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                userId1, userId2, userId1, userId2);

        List<Map<String, Object>> response = messages.stream()
            .filter(msg -> msg.getIsDeleted() == null || !msg.getIsDeleted())
            .map(msg -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", msg.getId());
                map.put("senderId", msg.getSenderId());
                map.put("receiverId", msg.getReceiverId());
                map.put("content", msg.getContent());
                map.put("createdAt", msg.getCreatedAt());
                map.put("isEdited", msg.getIsEdited() != null && msg.getIsEdited());
                map.put("updatedAt", msg.getUpdatedAt());

                // Add sender info
                @SuppressWarnings("null")
                User sender = userRepository.findById(msg.getSenderId()).orElse(null);
                if (sender != null) {
                    Map<String, String> senderMap = new HashMap<>();
                    senderMap.put("firstName", sender.getFirstName());
                    senderMap.put("lastName", sender.getLastName());
                    map.put("sender", senderMap);
                }

                // Add receiver info
                @SuppressWarnings("null")
                User receiver = userRepository.findById(msg.getReceiverId()).orElse(null);
                if (receiver != null) {
                    Map<String, String> receiverMap = new HashMap<>();
                    receiverMap.put("firstName", receiver.getFirstName());
                    receiverMap.put("lastName", receiver.getLastName());
                    map.put("receiver", receiverMap);
                }

                return map;
            }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Get all users (you already have this)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("email", user.getEmail());
            map.put("status", user.getStatus());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.Message;
import com.snopitech.teams_collaboration_backend.model.User;
import com.snopitech.teams_collaboration_backend.repository.ChannelMemberRepository;
import com.snopitech.teams_collaboration_backend.repository.MessageRepository;
import com.snopitech.teams_collaboration_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChannelMemberRepository channelMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        Long channelId = Long.valueOf(request.get("channelId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        String content = (String) request.get("content");

        if (!channelMemberRepository.existsByChannelIdAndUserId(channelId, userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You are not a member of this channel"));
        }

        Message message = new Message();
        message.setChannelId(channelId);
        message.setUserId(userId);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setIsEdited(false);
        message.setIsDeleted(false);

        Message savedMessage = messageRepository.save(message);

        @SuppressWarnings("null")
        User user = userRepository.findById(userId).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Message sent");
        response.put("messageId", savedMessage.getId());
        response.put("content", savedMessage.getContent());
        response.put("createdAt", savedMessage.getCreatedAt());
        response.put("isEdited", false);

        if (user != null) {
            Map<String, String> userMap = new HashMap<>();
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            response.put("user", userMap);
        }

        return ResponseEntity.ok(response);
    }

    @SuppressWarnings("null")
    @PostMapping("/{channelId}/upload")
    public ResponseEntity<?> uploadFile(
            @PathVariable Long channelId,
            @RequestParam Long userId,
            @RequestParam("file") MultipartFile file) {

        try {
            if (!channelMemberRepository.existsByChannelIdAndUserId(channelId, userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You are not a member of this channel"));
            }

            String projectDir = System.getProperty("user.dir");
            String uploadDir = projectDir + "/uploads";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + "/" + fileName;
            Path path = Paths.get(filePath);
            file.transferTo(path.toFile());

            Message message = new Message();
            message.setChannelId(channelId);
            message.setUserId(userId);
            message.setContent("📎 " + file.getOriginalFilename());
            message.setMessageType("FILE");
            message.setCreatedAt(LocalDateTime.now());
            message.setIsEdited(false);
            message.setIsDeleted(false);
            Message savedMessage = messageRepository.save(message);

            @SuppressWarnings("null")
            User user = userRepository.findById(userId).orElse(null);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "File uploaded");
            response.put("messageId", savedMessage.getId());
            response.put("fileName", file.getOriginalFilename());
            response.put("fileUrl", "/uploads/" + fileName);
            response.put("createdAt", savedMessage.getCreatedAt());

            if (user != null) {
                Map<String, String> userMap = new HashMap<>();
                userMap.put("firstName", user.getFirstName());
                userMap.put("lastName", user.getLastName());
                response.put("user", userMap);
            }

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId, @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String newContent = (String) request.get("content");

            @SuppressWarnings("null")
            Message message = messageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
            }

            if (!message.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You can only edit your own messages"));
            }

            if (Boolean.TRUE.equals(message.getIsDeleted())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot edit a deleted message"));
            }

            message.setContent(newContent);
            message.setIsEdited(true);
            message.setUpdatedAt(LocalDateTime.now());
            Message savedMessage = messageRepository.save(message);

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

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId, @RequestParam Long userId) {
        try {
            @SuppressWarnings("null")
            Message message = messageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
            }

            if (!message.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You can only delete your own messages"));
            }

            if (Boolean.TRUE.equals(message.getIsDeleted())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message already deleted"));
            }

            message.setIsDeleted(true);
            message.setContent("[Message deleted]");
            message.setUpdatedAt(LocalDateTime.now());
            messageRepository.save(message);

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

    @GetMapping("/channel/{channelId}")
    public ResponseEntity<?> getChannelMessages(@PathVariable Long channelId) {
        List<Message> messages = messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId);

        List<Map<String, Object>> response = messages.stream()
            .filter(msg -> msg.getIsDeleted() == null || !msg.getIsDeleted())
            .map(msg -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", msg.getId());
                map.put("channelId", msg.getChannelId());
                map.put("userId", msg.getUserId());
                map.put("content", msg.getContent());
                map.put("messageType", msg.getMessageType());
                map.put("createdAt", msg.getCreatedAt());
                map.put("isEdited", msg.getIsEdited() != null && msg.getIsEdited());
                map.put("updatedAt", msg.getUpdatedAt());

                @SuppressWarnings("null")
                User user = userRepository.findById(msg.getUserId()).orElse(null);
                if (user != null) {
                    Map<String, String> userMap = new HashMap<>();
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    map.put("user", userMap);
                }

                return map;
            }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            String projectDir = System.getProperty("user.dir");
            Path file = Paths.get(projectDir + "/uploads/" + filename);
            @SuppressWarnings("null")
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
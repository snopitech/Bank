package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.MessageReaction;
import com.snopitech.teams_collaboration_backend.repository.MessageReactionRepository;
import com.snopitech.teams_collaboration_backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageReactionController {

    @Autowired
    private MessageReactionRepository reactionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @SuppressWarnings("null")
    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<?> addReaction(@PathVariable Long messageId, @RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String emoji = (String) request.get("emoji");

        if (!messageRepository.existsById(messageId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
        }

        if (reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, userId, emoji).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reaction already added"));
        }

        MessageReaction reaction = new MessageReaction();
        reaction.setMessageId(messageId);
        reaction.setUserId(userId);
        reaction.setEmoji(emoji);
        reaction.setCreatedAt(LocalDateTime.now());

        reactionRepository.save(reaction);

        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reaction added");
        response.put("reactions", reactions);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<?> removeReaction(@PathVariable Long messageId, @RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String emoji = (String) request.get("emoji");

        reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, userId, emoji)
                .ifPresent(reactionRepository::delete);

        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reaction removed");
        response.put("reactions", reactions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{messageId}/reactions")
    public ResponseEntity<?> getReactions(@PathVariable Long messageId) {
        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);
        return ResponseEntity.ok(reactions);
    }
}
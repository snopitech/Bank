package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.dto.ChatMessage;
import com.snopitech.teams_collaboration_backend.model.Message;
import com.snopitech.teams_collaboration_backend.model.MessageReaction;
import com.snopitech.teams_collaboration_backend.repository.ChannelMemberRepository;
import com.snopitech.teams_collaboration_backend.repository.MessageReactionRepository;
import com.snopitech.teams_collaboration_backend.repository.MessageRepository;
import com.snopitech.teams_collaboration_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @SuppressWarnings("unused")
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageReactionRepository reactionRepository;

    @Autowired
    private ChannelMemberRepository channelMemberRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        boolean isMember = channelMemberRepository.existsByChannelIdAndUserId(
                chatMessage.getChannelId(), 
                chatMessage.getUserId()
        );

        if (!isMember) {
            return;
        }

        Message message = new Message();
        message.setChannelId(chatMessage.getChannelId());
        message.setUserId(chatMessage.getUserId());
        message.setContent(chatMessage.getContent());
        message.setCreatedAt(LocalDateTime.now());
        message.setIsEdited(false);
        Message savedMessage = messageRepository.save(message);

        chatMessage.setMessageId(savedMessage.getId());
        chatMessage.setTimestamp(savedMessage.getCreatedAt());
        chatMessage.setIsEdited(false);
        chatMessage.setUpdatedAt(null);

        messagingTemplate.convertAndSend(
            "/topic/channel/" + chatMessage.getChannelId(), 
            chatMessage
        );
    }

    @MessageMapping("/chat.react")
    public void addReaction(@Payload Map<String, Object> reaction) {
        Long messageId = Long.valueOf(reaction.get("messageId").toString());
        Long userId = Long.valueOf(reaction.get("userId").toString());
        String emoji = (String) reaction.get("emoji");
        Long channelId = Long.valueOf(reaction.get("channelId").toString());

        MessageReaction messageReaction = new MessageReaction();
        messageReaction.setMessageId(messageId);
        messageReaction.setUserId(userId);
        messageReaction.setEmoji(emoji);
        messageReaction.setCreatedAt(LocalDateTime.now());
        reactionRepository.save(messageReaction);

        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);

        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "REACTION");
        broadcast.put("messageId", messageId);
        broadcast.put("reactions", reactions);

        messagingTemplate.convertAndSend("/topic/channel/" + channelId, broadcast);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend(
            "/topic/channel/" + chatMessage.getChannelId() + "/typing",
            chatMessage
        );
    }
}
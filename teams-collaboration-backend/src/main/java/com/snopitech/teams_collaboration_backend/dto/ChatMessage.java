package com.snopitech.teams_collaboration_backend.dto;

import java.time.LocalDateTime;

public class ChatMessage {

    private String type;
    private Long messageId;
    private Long channelId;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isEdited;
    private LocalDateTime updatedAt;

    public ChatMessage() {}

    public ChatMessage(String type, Long channelId, Long userId, String userFirstName, String userLastName, String content) {
        this.type = type;
        this.channelId = channelId;
        this.userId = userId;
        this.userFirstName = userFirstName;
        this.userLastName = userLastName;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public Long getChannelId() { return channelId; }
    public void setChannelId(Long channelId) { this.channelId = channelId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFirstName() { return userFirstName; }
    public void setUserFirstName(String userFirstName) { this.userFirstName = userFirstName; }

    public String getUserLastName() { return userLastName; }
    public void setUserLastName(String userLastName) { this.userLastName = userLastName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
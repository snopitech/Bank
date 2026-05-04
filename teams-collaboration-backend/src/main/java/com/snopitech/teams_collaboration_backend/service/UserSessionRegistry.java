package com.snopitech.teams_collaboration_backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionRegistry {
    
    private final ConcurrentHashMap<Long, String> userSessions = new ConcurrentHashMap<>();
    
    public void addUser(Long userId, String sessionId) {
        userSessions.put(userId, sessionId);
    }
    
    public void removeUser(Long userId) {
        userSessions.remove(userId);
    }
    
    public boolean isUserOnline(Long userId) {
        return userSessions.containsKey(userId);
    }
    
    public String getSessionId(Long userId) {
        return userSessions.get(userId);
    }
    
    public ConcurrentHashMap<Long, String> getAllOnlineUsers() {
        return userSessions;
    }
}
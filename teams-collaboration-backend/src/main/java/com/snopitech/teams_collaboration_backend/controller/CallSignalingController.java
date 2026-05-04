package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.service.UserSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class CallSignalingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserSessionRegistry userSessionRegistry;

    @SuppressWarnings("null")
    @MessageMapping("/call.request")
    public void sendCallRequest(@Payload Map<String, Object> payload) {
        Long calleeId = Long.valueOf(payload.get("calleeId").toString());
        Long callerId = Long.valueOf(payload.get("callerId").toString());
        String callerName = payload.get("callerName").toString();
        
        if (userSessionRegistry.isUserOnline(calleeId)) {
            messagingTemplate.convertAndSendToUser(
                String.valueOf(calleeId),
                "/queue/call.request",
                Map.of(
                    "callerId", callerId,
                    "callerName", callerName,
                    "type", "incoming_call"
                )
            );
        } else {
            messagingTemplate.convertAndSendToUser(
                String.valueOf(callerId),
                "/queue/call.response",
                Map.of(
                    "success", false,
                    "message", "User is offline"
                )
            );
        }
    }

    @SuppressWarnings("null")
    @MessageMapping("/call.offer")
    public void sendOffer(@Payload Map<String, Object> payload) {
        Long calleeId = Long.valueOf(payload.get("calleeId").toString());
        String offer = payload.get("offer").toString();
        Long callerId = Long.valueOf(payload.get("callerId").toString());
        String callerName = payload.get("callerName").toString();
        
        messagingTemplate.convertAndSendToUser(
            String.valueOf(calleeId),
            "/queue/call.offer",
            Map.of(
                "callerId", callerId,
                "callerName", callerName,
                "offer", offer
            )
        );
    }

    @SuppressWarnings("null")
    @MessageMapping("/call.answer")
    public void sendAnswer(@Payload Map<String, Object> payload) {
        Long callerId = Long.valueOf(payload.get("callerId").toString());
        String answer = payload.get("answer").toString();
        
        messagingTemplate.convertAndSendToUser(
            String.valueOf(callerId),
            "/queue/call.answer",
            Map.of("answer", answer)
        );
    }

    @SuppressWarnings("null")
    @MessageMapping("/call.ice")
    public void sendIceCandidate(@Payload Map<String, Object> payload) {
        Long targetUserId = Long.valueOf(payload.get("targetUserId").toString());
        Object candidate = payload.get("candidate");
        
        messagingTemplate.convertAndSendToUser(
            String.valueOf(targetUserId),
            "/queue/call.ice",
            Map.of("candidate", candidate)
        );
    }

    @SuppressWarnings("null")
    @MessageMapping("/call.response")
    public void sendCallResponse(@Payload Map<String, Object> payload) {
        Long callerId = Long.valueOf(payload.get("callerId").toString());
        Boolean accepted = (Boolean) payload.get("accepted");
        
        messagingTemplate.convertAndSendToUser(
            String.valueOf(callerId),
            "/queue/call.response",
            Map.of(
                "accepted", accepted,
                "type", accepted ? "call_accepted" : "call_rejected"
            )
        );
    }
}
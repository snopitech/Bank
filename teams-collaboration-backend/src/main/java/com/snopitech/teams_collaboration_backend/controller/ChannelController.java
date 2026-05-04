package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.Channel;
import com.snopitech.teams_collaboration_backend.model.ChannelMember;
import com.snopitech.teams_collaboration_backend.repository.ChannelMemberRepository;
import com.snopitech.teams_collaboration_backend.repository.ChannelRepository;
import com.snopitech.teams_collaboration_backend.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private ChannelMemberRepository channelMemberRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @PostMapping
    public ResponseEntity<?> createChannel(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        Long teamId = Long.valueOf(request.get("teamId").toString());
        Long createdBy = Long.valueOf(request.get("userId").toString());
        String type = request.get("type") != null ? request.get("type").toString() : "PUBLIC";

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, createdBy)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You are not a member of this team"));
        }

        Channel channel = new Channel();
        channel.setTeamId(teamId);
        channel.setName(name);
        channel.setDescription(description);
        channel.setType(type);
        channel.setCreatedBy(createdBy);
        channel.setCreatedAt(LocalDateTime.now());

        Channel savedChannel = channelRepository.save(channel);

        // ALWAYS add creator as a member (both PUBLIC and PRIVATE)
        ChannelMember member = new ChannelMember();
        member.setChannelId(savedChannel.getId());
        member.setUserId(createdBy);
        member.setAddedAt(LocalDateTime.now());
        channelMemberRepository.save(member);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Channel created successfully");
        response.put("channelId", savedChannel.getId());
        response.put("name", savedChannel.getName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getTeamChannels(@PathVariable Long teamId) {
        List<Channel> channels = channelRepository.findByTeamId(teamId);
        return ResponseEntity.ok(channels);
    }

    @PostMapping("/{channelId}/members")
    public ResponseEntity<?> addChannelMember(@PathVariable Long channelId, @RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());

        if (channelMemberRepository.existsByChannelIdAndUserId(channelId, userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is already a member of this channel"));
        }

        ChannelMember member = new ChannelMember();
        member.setChannelId(channelId);
        member.setUserId(userId);
        member.setAddedAt(LocalDateTime.now());

        channelMemberRepository.save(member);

        return ResponseEntity.ok(Map.of("success", true, "message", "Member added to channel"));
    }
}
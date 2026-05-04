package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.model.Team;
import com.snopitech.teams_collaboration_backend.model.TeamMember;
import com.snopitech.teams_collaboration_backend.repository.TeamMemberRepository;
import com.snopitech.teams_collaboration_backend.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        Long userId = Long.valueOf(request.get("userId").toString());

        Team team = new Team();
        team.setName(name);
        team.setDescription(description);
        team.setCreatedBy(userId);
        team.setCreatedAt(LocalDateTime.now());

        Team savedTeam = teamRepository.save(team);

        TeamMember member = new TeamMember();
        member.setTeamId(savedTeam.getId());
        member.setUserId(userId);
        member.setRole("OWNER");
        member.setJoinedAt(LocalDateTime.now());
        teamMemberRepository.save(member);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Team created successfully");
        response.put("teamId", savedTeam.getId());
        response.put("name", savedTeam.getName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTeams(@PathVariable Long userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        
        @SuppressWarnings("null")
        List<Map<String, Object>> teams = memberships.stream().map(membership -> {
            Team team = teamRepository.findById(membership.getTeamId()).orElse(null);
            if (team != null) {
                Map<String, Object> teamInfo = new HashMap<>();
                teamInfo.put("id", team.getId());
                teamInfo.put("name", team.getName());
                teamInfo.put("description", team.getDescription());
                teamInfo.put("role", membership.getRole());
                teamInfo.put("joinedAt", membership.getJoinedAt());
                return teamInfo;
            }
            return null;
        }).filter(team -> team != null).toList();

        return ResponseEntity.ok(teams);
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<?> addMember(@PathVariable Long teamId, @RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String role = request.get("role") != null ? request.get("role").toString() : "MEMBER";

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is already a member of this team"));
        }

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setUserId(userId);
        member.setRole(role);
        member.setJoinedAt(LocalDateTime.now());

        teamMemberRepository.save(member);

        return ResponseEntity.ok(Map.of("success", true, "message", "Member added successfully"));
    }
}

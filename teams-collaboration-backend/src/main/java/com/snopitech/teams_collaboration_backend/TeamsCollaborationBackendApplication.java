package com.snopitech.teams_collaboration_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TeamsCollaborationBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeamsCollaborationBackendApplication.class, args);
        System.out.println("🚀 Teams Collaboration Backend Started on port 8081");
    }
}
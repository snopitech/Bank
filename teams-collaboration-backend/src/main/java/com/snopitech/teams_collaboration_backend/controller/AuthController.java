package com.snopitech.teams_collaboration_backend.controller;

import com.snopitech.teams_collaboration_backend.dto.AuthResponse;
import com.snopitech.teams_collaboration_backend.dto.LoginRequest;
import com.snopitech.teams_collaboration_backend.dto.RegisterRequest;
import com.snopitech.teams_collaboration_backend.model.User;
import com.snopitech.teams_collaboration_backend.repository.UserRepository;
import com.snopitech.teams_collaboration_backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email already registered"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus("OFFLINE");

        User savedUser = userRepository.save(user);

        // Send welcome email
        try {
            String subject = "Welcome to Snopitech Teams!";
            String message = String.format(
                "Hello %s %s,\n\n" +
                "Your Snopitech Teams account has been successfully created!\n\n" +
                "You can now log in using your email: %s\n\n" +
                "Login URL: %s\n\n" +
                "Best regards,\n" +
                "Snopitech Teams Team",
                request.getFirstName(), request.getLastName(),
                request.getEmail(),
                frontendUrl
            );
            emailService.sendSimpleEmail(request.getEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        return ResponseEntity.ok(new AuthResponse(
                true,
                "Registration successful. A welcome email has been sent.",
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        ));
    }

    @PostMapping("/resend-invite")
    public ResponseEntity<?> resendInvite(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No account found with this email"));
        }
        
        try {
            // Send invitation email
            String subject = "Your Snopitech Teams Invitation";
            String message = String.format(
                "Hello %s %s,\n\n" +
                "You have been invited to join Snopitech Teams.\n\n" +
                "Your account has already been created. Please use your email and the password you set during registration to log in.\n\n" +
                "Login URL: %s\n\n" +
                "Best regards,\n" +
                "Snopitech Teams Team",
                user.getFirstName(), user.getLastName(),
                frontendUrl
            );
            
            emailService.sendSimpleEmail(email, subject, message);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Invitation resent to " + email));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to send invitation: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Invalid email or password"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Invalid email or password"));
        }

        user.setLastActive(LocalDateTime.now());
        user.setStatus("ONLINE");
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(
                true,
                "Login successful",
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        ));
    }
}
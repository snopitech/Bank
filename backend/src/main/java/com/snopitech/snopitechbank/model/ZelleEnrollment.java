package com.snopitech.snopitechbank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "zelle_enrollments")
public class ZelleEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    private boolean active = true;

    // Constructors
    public ZelleEnrollment() {
        this.enrolledAt = LocalDateTime.now();
    }

    public ZelleEnrollment(User user, Account account, String email, String phone, String fullName) {
        this.user = user;
        this.account = account;
        this.email = email;
        this.phone = phone;
        this.fullName = fullName;
        this.enrolledAt = LocalDateTime.now();
        this.active = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
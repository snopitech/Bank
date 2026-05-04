package com.snopitech.snopitechbank.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnoreProperties({"accounts"}) // Add this line
    private Long id;

    @Column(name = "owner_name")
    private String ownerName;

    private double balance;

    @Column(name = "account_type")
    private String accountType; // CHECKING or SAVINGS (String, not enum)

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "routing_number")
    private String routingNumber;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "nickname")
    private String nickname;

    // Add this with other fields
    @Column(name = "is_closed")
    private Boolean closed = false;

    @Column(name = "closed_date")
    private LocalDateTime closedDate;

    @Column(name = "closure_reason")
    private String closureReason;
   
@Column(name = "is_disabled")
private Boolean disabled = false;

@Column(name = "disabled_date")
private LocalDateTime disabledDate;

    public Account() {}

    public Account(String ownerName, double balance, String accountType) {
        this.ownerName = ownerName;
        this.balance = balance;
        this.accountType = accountType;
    }

    public Long getId() {
        return id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getRoutingNumber() {
        return routingNumber;
    }

    public void setRoutingNumber(String routingNumber) {
        this.routingNumber = routingNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getNickname() {
    return nickname;
    }

    public void setNickname(String nickname) {
    this.nickname = nickname;
    }
    public Boolean isClosed() {
    return closed != null ? closed : false;
    }

    public void setClosed(Boolean closed) {
    this.closed = closed;
    }

    public LocalDateTime getClosedDate() {
    return closedDate;
   }

    public void setClosedDate(LocalDateTime closedDate) {
    this.closedDate = closedDate;
   }

   public String getClosureReason() {
    return closureReason;
   }

   public void setClosureReason(String closureReason) {
    this.closureReason = closureReason;
   }
   public Boolean isDisabled() {
    return disabled != null ? disabled : false;
}

public void setDisabled(Boolean disabled) {
    this.disabled = disabled;
}

public LocalDateTime getDisabledDate() {
    return disabledDate;
}

@Column(name = "opened_by_employee_id")
private Long openedByEmployeeId;

@Column(name = "opened_by_employee_name")
private String openedByEmployeeName;

@Column(name = "opened_at")
private LocalDateTime openedAt;

public void setDisabledDate(LocalDateTime disabledDate) {
    this.disabledDate = disabledDate;
}
   // Add this helper method for masked account number
    public String getMaskedAccountNumber() {
    if (this.accountNumber == null || this.accountNumber.length() < 4) {
        return "****";
    }
    return "****" + this.accountNumber.substring(this.accountNumber.length() - 4);
}
}

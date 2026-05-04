package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.BankerAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankerAuditLogRepository extends JpaRepository<BankerAuditLog, Long> {
}

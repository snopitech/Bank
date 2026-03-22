package com.snopitech.snopitechbank.repository;

import com.snopitech.snopitechbank.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Get all alerts for a user, ordered by most recent first
    List<Alert> findByUserIdOrderByTimestampDesc(Long userId);

    // Get only unread alerts for a user - FIXED: ReadFalse -> IsReadFalse
    List<Alert> findByUserIdAndIsReadFalseOrderByTimestampDesc(Long userId);

    // Get count of unread alerts for a user - FIXED: ReadFalse -> IsReadFalse
    Long countByUserIdAndIsReadFalse(Long userId);

    // Delete all alerts for a specific user
    void deleteByUserId(Long userId);

    // Delete specific alerts by their IDs for a specific user
    @Modifying
    @Transactional
    @Query("DELETE FROM Alert a WHERE a.user.id = :userId AND a.id IN :alertIds")
    void deleteByUserIdAndIdIn(@Param("userId") Long userId, @Param("alertIds") List<Long> alertIds);

    // Mark all alerts as read for a user - FIXED: a.read -> a.isRead
    @Modifying
    @Transactional
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.user.id = :userId AND a.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);
}
package com.snopitech.teams_collaboration_backend.repository;

import com.snopitech.teams_collaboration_backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByChannelIdOrderByCreatedAtAsc(Long channelId);
    
    List<Message> findByUserId(Long userId);
}

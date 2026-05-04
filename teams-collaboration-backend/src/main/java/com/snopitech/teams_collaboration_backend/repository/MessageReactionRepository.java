package com.snopitech.teams_collaboration_backend.repository;

import com.snopitech.teams_collaboration_backend.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    
    List<MessageReaction> findByMessageId(Long messageId);
    
    Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}

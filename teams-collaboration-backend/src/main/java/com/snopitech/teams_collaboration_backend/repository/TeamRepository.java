package com.snopitech.teams_collaboration_backend.repository;

import com.snopitech.teams_collaboration_backend.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCreatedBy(Long userId);
}

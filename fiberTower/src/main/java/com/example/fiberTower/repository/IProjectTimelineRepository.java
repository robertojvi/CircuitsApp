package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IProjectTimelineRepository extends JpaRepository<ProjectTimeline, Long> {
    Optional<ProjectTimeline> findBySiteId(Long siteId);
}

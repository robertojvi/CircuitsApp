package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectDelay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IProjectDelayRepository extends JpaRepository<ProjectDelay, Long> {
    List<ProjectDelay> findBySiteIdOrderByDateRecordedAsc(Long siteId);
}

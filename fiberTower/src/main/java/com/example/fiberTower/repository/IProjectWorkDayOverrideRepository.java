package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectWorkDayOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProjectWorkDayOverrideRepository extends JpaRepository<ProjectWorkDayOverride, Long> {
    List<ProjectWorkDayOverride> findBySiteId(Long siteId);
    Optional<ProjectWorkDayOverride> findBySiteIdAndDate(Long siteId, String date);
}

package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectScopeOfWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IProjectScopeOfWorkRepository extends JpaRepository<ProjectScopeOfWork, Long> {
    Optional<ProjectScopeOfWork> findBySiteId(Long siteId);
}

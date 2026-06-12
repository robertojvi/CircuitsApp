package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IProjectUpdateRepository extends JpaRepository<ProjectUpdate, Long> {
    List<ProjectUpdate> findBySiteIdOrderByUpdateDateDescIdDesc(Long siteId);
}

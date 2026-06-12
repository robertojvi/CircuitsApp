package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectProgressItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IProjectProgressItemRepository extends JpaRepository<ProjectProgressItem, Long> {
    List<ProjectProgressItem> findBySiteId(Long siteId);
    Optional<ProjectProgressItem> findBySiteIdAndCategory(Long siteId, String category);
}

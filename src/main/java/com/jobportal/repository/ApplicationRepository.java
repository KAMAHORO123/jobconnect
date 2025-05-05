package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobSeekerIdOrderByCreatedAtDesc(Long jobSeekerId);
    List<Application> findByJobIdOrderByCreatedAtDesc(Long jobId);
    Optional<Application> findByJobIdAndJobSeekerId(Long jobId, Long jobSeekerId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job WHERE a.jobSeekerId = :jobSeekerId ORDER BY a.createdAt DESC")
    List<Application> findByJobSeekerIdWithJob(@Param("jobSeekerId") Long jobSeekerId);
} 
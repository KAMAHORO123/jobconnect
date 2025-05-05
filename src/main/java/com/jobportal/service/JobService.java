package com.jobportal.service;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobService {
    
    private static final Logger logger = LoggerFactory.getLogger(JobService.class);
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Transactional
    public Job createJob(Job job, User employer) {
        try {
            logger.info("Creating new job for employer: {}", employer.getUsername());
            job.setEmployer(employer);
            job.setPostedDate(LocalDateTime.now());
            return jobRepository.save(job);
        } catch (Exception e) {
            logger.error("Error creating job: {}", e.getMessage());
            throw new RuntimeException("Failed to create job", e);
        }
    }

    public List<Job> getAllJobs() {
        try {
            logger.info("Fetching all jobs");
            return jobRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching all jobs: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch jobs", e);
        }
    }

    public List<Job> getEmployerJobs(User employer) {
        try {
            logger.info("Fetching jobs for employer: {}", employer.getUsername());
            return jobRepository.findByEmployer(employer);
        } catch (Exception e) {
            logger.error("Error fetching employer jobs: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch employer jobs", e);
        }
    }

    public Job getJobById(Long id) {
        try {
            logger.info("Fetching job by ID: {}", id);
            return jobRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Job not found with ID: {}", id);
                    return new RuntimeException("Job not found");
                });
        } catch (Exception e) {
            logger.error("Error fetching job by ID: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch job", e);
        }
    }

    @Transactional
    public Job updateJob(Job job) {
        try {
            logger.info("Updating job with ID: {}", job.getId());
            Job existingJob = getJobById(job.getId());
            existingJob.setTitle(job.getTitle());
            existingJob.setCompany(job.getCompany());
            existingJob.setLocation(job.getLocation());
            existingJob.setType(job.getType());
            existingJob.setDescription(job.getDescription());
            existingJob.setRequirements(job.getRequirements());
            existingJob.setSalary(job.getSalary());
            existingJob.setStatus(job.getStatus());
            return jobRepository.save(existingJob);
        } catch (Exception e) {
            logger.error("Error updating job: {}", e.getMessage());
            throw new RuntimeException("Failed to update job", e);
        }
    }

    @Transactional
    public void deleteJob(Long id) {
        try {
            logger.info("Deleting job with ID: {}", id);
            Job job = getJobById(id);
            jobRepository.delete(job);
        } catch (Exception e) {
            logger.error("Error deleting job: {}", e.getMessage());
            throw new RuntimeException("Failed to delete job", e);
        }
    }
} 
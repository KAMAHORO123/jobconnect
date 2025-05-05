package com.jobportal.service;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    public Application applyForJob(Long jobId, Long jobSeekerId, MultipartFile cvFile, String coverLetter) throws IOException {
        // Check if user has already applied
        if (hasAppliedForJob(jobId, jobSeekerId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Get the job entity
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        Application application = new Application();
        application.setJob(job);
        application.setJobSeekerId(jobSeekerId);
        application.setStatus(Application.Status.PENDING);
        Timestamp now = new Timestamp(System.currentTimeMillis());
        application.setCreatedAt(now);
        application.setUpdatedAt(now);
        application.setCv(cvFile.getBytes());
        application.setCvFilename(cvFile.getOriginalFilename());
        application.setCvMimetype(cvFile.getContentType());
        application.setCoverLetter(coverLetter);
        return applicationRepository.save(application);
    }

    public boolean hasAppliedForJob(Long jobId, Long jobSeekerId) {
        return applicationRepository.findByJobIdAndJobSeekerId(jobId, jobSeekerId).isPresent();
    }

    public List<Application> getApplicationsForUser(Long jobSeekerId) {
        return applicationRepository.findByJobSeekerIdWithJob(jobSeekerId);
    }

    public Application getApplicationById(Long applicationId) {
        return applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<Application> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId);
    }

    public Application save(Application application) {
        return applicationRepository.save(application);
    }
} 
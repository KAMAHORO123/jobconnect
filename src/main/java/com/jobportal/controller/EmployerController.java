package com.jobportal.controller;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.service.ApplicationService;
import com.jobportal.service.JobService;
import com.jobportal.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/employer")
public class EmployerController {
    
    private static final Logger logger = LoggerFactory.getLogger(EmployerController.class);
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final UserService userService;

    public EmployerController(JobService jobService, ApplicationService applicationService, UserService userService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.userService = userService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getEmployerJobs() {
        try {
            logger.info("Fetching employer jobs");
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("User not authenticated");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
            }

            String username = authentication.getName();
            logger.info("Authenticated user: {}", username);
            
            Optional<User> employerOpt = userService.findByUsername(username);
            if (employerOpt.isEmpty()) {
                logger.warn("Employer not found for username: {}", username);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found");
            }

            User employer = employerOpt.get();
            if (!employer.getRole().equals("EMPLOYER")) {
                logger.warn("User is not an employer: {}", username);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not an employer");
            }

            List<Job> jobs = jobService.getEmployerJobs(employer);
            logger.info("Successfully fetched {} jobs for employer: {}", jobs.size(), username);
            return ResponseEntity.ok(jobs);
        } catch (ResponseStatusException e) {
            logger.error("Error fetching employer jobs: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error fetching employer jobs", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch employer jobs", e);
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getAllApplicationsForEmployer() {
        try {
            logger.info("Fetching all applications for employer");
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("User not authenticated");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
            }

            String username = authentication.getName();
            logger.info("Authenticated user: {}", username);
            
            Optional<User> employerOpt = userService.findByUsername(username);
            if (employerOpt.isEmpty()) {
                logger.warn("Employer not found for username: {}", username);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found");
            }

            User employer = employerOpt.get();
            if (!employer.getRole().equals("EMPLOYER")) {
                logger.warn("User is not an employer: {}", username);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not an employer");
            }

            List<Job> jobs = jobService.getEmployerJobs(employer);
            List<Application> allApplications = new ArrayList<>();
            
            for (Job job : jobs) {
                List<Application> jobApplications = applicationService.getApplicationsForJob(job.getId());
                for (Application application : jobApplications) {
                    try {
                        User jobSeeker = userService.getUserById(application.getJobSeekerId());
                        application.setJobSeekerEmail(jobSeeker.getEmail());
                    } catch (Exception e) {
                        logger.warn("Failed to get job seeker email for application {}: {}", application.getId(), e.getMessage());
                        application.setJobSeekerEmail("Unknown");
                    }
                }
                allApplications.addAll(jobApplications);
            }
            
            logger.info("Successfully fetched {} applications for employer: {}", allApplications.size(), username);
            return ResponseEntity.ok(allApplications);
        } catch (ResponseStatusException e) {
            logger.error("Error fetching applications: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error fetching applications", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch applications", e);
        }
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId, @RequestBody Map<String, String> body) {
        try {
            logger.info("Updating application status for application ID: {}", applicationId);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Optional<User> employerOpt = userService.findByUsername(username);
            if (employerOpt.isEmpty()) {
                logger.warn("Employer not found for username: {}", username);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found");
            }

            User employer = employerOpt.get();
            if (!employer.getRole().equals("EMPLOYER")) {
                logger.warn("User is not an employer: {}", username);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not an employer");
            }
            
            Application application = applicationService.getApplicationById(applicationId);
            if (application == null) {
                logger.warn("Application not found: {}", applicationId);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
            }
            
            List<Job> employerJobs = jobService.getEmployerJobs(employer);
            boolean isEmployerJob = employerJobs.stream()
                .anyMatch(job -> job.getId().equals(application.getJob().getId()));
            if (!isEmployerJob) {
                logger.warn("Unauthorized access to application: {}", applicationId);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this application");
            }

            String status = body.get("status");
            if (status == null) {
                logger.warn("Status is missing in request body");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
            }

            try {
                Application.Status newStatus = Application.Status.valueOf(status);
                application.setStatus(newStatus);
                application.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                Application updated = applicationService.save(application);
                logger.info("Successfully updated application status to {} for application ID: {}", status, applicationId);
                return ResponseEntity.ok(updated);
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status value: {}", status);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
            }
        } catch (ResponseStatusException e) {
            logger.error("Error updating application status: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error updating application status", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update application status", e);
        }
    }

    @GetMapping("/applications/{applicationId}/cv")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long applicationId, @RequestParam(value = "download", required = false) Boolean download) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Optional<User> employerOpt = userService.findByUsername(username);
            if (employerOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found");
            }

            User employer = employerOpt.get();
            if (!employer.getRole().equals("EMPLOYER")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not an employer");
            }

            Application application = applicationService.getApplicationById(applicationId);
            if (application == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
            }

            List<Job> employerJobs = jobService.getEmployerJobs(employer);
            boolean isEmployerJob = employerJobs.stream()
                .anyMatch(job -> job.getId().equals(application.getJob().getId()));
            if (!isEmployerJob) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view this CV");
            }

            if (application.getCv() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
            }

            String disposition = (download != null && download)
                ? "attachment; filename=\"" + application.getCvFilename() + "\""
                : "inline; filename=\"" + application.getCvFilename() + "\"";
            String mimeType = application.getCvMimetype();
            String filename = application.getCvFilename();
            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                mimeType = "application/pdf";
            }

            return ResponseEntity.ok()
                .header("Content-Disposition", disposition)
                .header("Content-Type", mimeType)
                .body(application.getCv());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to download CV", e);
        }
    }
} 
package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.service.JobService;
import com.jobportal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    private final JobService jobService;
    private final UserService userService;

    public JobController(JobService jobService, UserService userService) {
        this.jobService = jobService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        try {
            List<Job> jobs = jobService.getAllJobs();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        try {
            Job job = jobService.getJobById(id);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User employer = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Log the role for debugging
            System.out.println("User role: " + employer.getRole());
            System.out.println("User authorities: " + authentication.getAuthorities());
            
            // Check if user has employer role
            boolean isEmployer = employer.getRole().equals("EMPLOYER") || 
                               employer.getRole().equals("ROLE_EMPLOYER") ||
                               authentication.getAuthorities().stream()
                                   .anyMatch(auth -> auth.getAuthority().equals("ROLE_EMPLOYER"));
            
            if (!isEmployer) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header("X-Error-Message", "User role: " + employer.getRole() + 
                            ", Required role: EMPLOYER or ROLE_EMPLOYER")
                    .build();
            }
            
            job.setStatus("ACTIVE");
            Job createdJob = jobService.createJob(job, employer);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("X-Error-Message", e.getMessage())
                .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("X-Error-Message", "An unexpected error occurred: " + e.getMessage())
                .build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User employer = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Job existingJob = jobService.getJobById(id);
            if (!existingJob.getEmployer().getId().equals(employer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            job.setId(id);
            Job updatedJob = jobService.updateJob(job);
            return ResponseEntity.ok(updatedJob);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User employer = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Job job = jobService.getJobById(id);
            if (!job.getEmployer().getId().equals(employer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            jobService.deleteJob(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 
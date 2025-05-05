package com.jobportal.controller;

import com.jobportal.entity.Application;
import com.jobportal.entity.User;
import com.jobportal.service.ApplicationService;
import com.jobportal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobseeker")
public class JobSeekerController {
    
    private final ApplicationService applicationService;
    private final UserService userService;

    public JobSeekerController(ApplicationService applicationService, UserService userService) {
        this.applicationService = applicationService;
        this.userService = userService;
    }

    @GetMapping("/has-applied/{jobId}")
    public ResponseEntity<Map<String, Boolean>> hasAppliedForJob(@PathVariable Long jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User jobSeeker = userService.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean hasApplied = applicationService.hasAppliedForJob(jobId, jobSeeker.getId());
        return ResponseEntity.ok(Map.of("hasApplied", hasApplied));
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<Application> applyForJob(
            @PathVariable Long jobId,
            @RequestParam("cv") MultipartFile cvFile,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User jobSeeker = userService.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Application app = applicationService.applyForJob(jobId, jobSeeker.getId(), cvFile, coverLetter);
        return ResponseEntity.ok(app);
    }

    @PostMapping("/cv")
    public ResponseEntity<User> uploadCV(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User jobSeeker = userService.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.uploadCV(jobSeeker.getId(), file));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getMyApplications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            User jobSeeker = userService.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Application> applications = applicationService.getApplicationsForUser(jobSeeker.getId());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/applications/{applicationId}/cv")
    public ResponseEntity<byte[]> downloadMyCv(@PathVariable Long applicationId) {
        Application application = applicationService.getApplicationById(applicationId);
        // Optionally, check if the authenticated user is the owner of this application
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User jobSeeker = userService.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (!application.getJobSeekerId().equals(jobSeeker.getId())) {
            return ResponseEntity.status(403).build();
        }
        if (application.getCv() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "inline; filename=\"" + application.getCvFilename() + "\"")
            .header("Content-Type", application.getCvMimetype())
            .body(application.getCv());
    }
} 
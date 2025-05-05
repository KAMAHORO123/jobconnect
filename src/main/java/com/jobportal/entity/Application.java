package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.sql.Timestamp;

@Entity
@Table(name = "job_applications")
@Data
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"applications", "employer"})
    private Job job;

    @Column(name = "job_seeker_id")
    private Long jobSeekerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;

    @Column(name = "cover_letter")
    private String coverLetter;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Lob
    @Column(name = "cv",columnDefinition = "MEDIUMBLOB")
    @JsonIgnore
    private byte[] cv;

    @Column(name = "cv_filename")
    private String cvFilename;

    @Column(name = "cv_mimetype")
    private String cvMimetype;

    @Transient
    private String jobSeekerEmail;

    @Transient
    @JsonProperty("jobTitle")
    public String getJobTitle() {
        return job != null ? job.getTitle() : null;
    }

    public enum Status {
        PENDING, REVIEWED, ACCEPTED, REJECTED
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Job getJob() {
        return job;
    }

    public Long getJobSeekerId() {
        return jobSeekerId;
    }

    public Status getStatus() {
        return status;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public byte[] getCv() {
        return cv;
    }

    public String getCvFilename() {
        return cvFilename;
    }

    public String getCvMimetype() {
        return cvMimetype;
    }

    public String getJobSeekerEmail() {
        return jobSeekerEmail;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public void setJobSeekerId(Long jobSeekerId) {
        this.jobSeekerId = jobSeekerId;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setCv(byte[] cv) {
        this.cv = cv;
    }

    public void setCvFilename(String cvFilename) {
        this.cvFilename = cvFilename;
    }

    public void setCvMimetype(String cvMimetype) {
        this.cvMimetype = cvMimetype;
    }

    public void setJobSeekerEmail(String jobSeekerEmail) {
        this.jobSeekerEmail = jobSeekerEmail;
    }
} 
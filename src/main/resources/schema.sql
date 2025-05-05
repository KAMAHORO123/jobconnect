-- Create database if not exists
CREATE DATABASE IF NOT EXISTS job_portal;

-- Use the database
USE job_portal;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    cv LONGBLOB
);

-- Create job table
CREATE TABLE IF NOT EXISTS job (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(50),
    description TEXT,
    requirements TEXT,
    salary VARCHAR(255),
    status VARCHAR(50),
    posted_date DATETIME,
    employer_id BIGINT,
    FOREIGN KEY (employer_id) REFERENCES user(id)
);

-- Create application table
CREATE TABLE IF NOT EXISTS application (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT,
    job_seeker_id BIGINT,
    status VARCHAR(50),
    applied_date DATETIME,
    cv LONGBLOB,
    FOREIGN KEY (job_id) REFERENCES job(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES user(id)
); 
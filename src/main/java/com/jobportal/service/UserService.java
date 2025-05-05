package com.jobportal.service;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String username, String password, String email, String role, String name) {
        try {
            logger.info("Registering new user: {}", username);
            if (userRepository.findByEmail(email).isPresent()) {
                throw new RuntimeException("This email is already used. Please use a different email address.");
            }
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setName(name);
            String normalizedRole = role.toUpperCase();
            if (!normalizedRole.startsWith("ROLE_")) {
                normalizedRole = "ROLE_" + normalizedRole;
            }
            user.setRole(normalizedRole);
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error registering user: {}", e.getMessage());
            throw new RuntimeException("Failed to register user", e);
        }
    }

    public Optional<User> findByUsername(String username) {
        try {
            logger.info("Finding user by username: {}", username);
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            logger.error("Error finding user by username: {}", e.getMessage());
            throw new RuntimeException("Failed to find user by username", e);
        }
    }

    public User getUserByEmail(String email) {
        try {
            logger.info("Finding user by email: {}", email);
            return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("User not found with email: {}", email);
                    return new RuntimeException("User not found");
                });
        } catch (Exception e) {
            logger.error("Error finding user by email: {}", e.getMessage());
            throw new RuntimeException("Failed to find user by email", e);
        }
    }

    public User getUserById(Long id) {
        try {
            logger.info("Finding user by ID: {}", id);
            return userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
        } catch (Exception e) {
            logger.error("Error finding user by ID: {}", e.getMessage());
            throw new RuntimeException("Failed to find user by ID", e);
        }
    }

    public User uploadCV(Long userId, MultipartFile file) throws IOException {
        try {
            logger.info("Uploading CV for user ID: {}", userId);
            User user = getUserById(userId);
            user.setCv(file.getBytes());
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error uploading CV: {}", e.getMessage());
            throw new RuntimeException("Failed to upload CV", e);
        }
    }

    public UserDetails loadUserByUsername(String username) {
        try {
            logger.info("Loading user details for username: {}", username);
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                logger.warn("User not found with username: {}", username);
                throw new UsernameNotFoundException("User not found with username: " + username);
            }
            User user = userOpt.get();
            return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
            );
        } catch (Exception e) {
            logger.error("Error loading user by username: {}", e.getMessage());
            throw new RuntimeException("Failed to load user by username", e);
        }
    }
} 
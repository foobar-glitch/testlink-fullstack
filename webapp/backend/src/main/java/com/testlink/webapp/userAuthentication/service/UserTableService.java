package com.testlink.webapp.userAuthentication.service;

import com.testlink.webapp.userAuthentication.entity.UserTable;
import com.testlink.webapp.userAuthentication.repository.UserTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserTableService {

    private final UserTableRepository userTableRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserTable> getAllUsers() {
        return userTableRepository.findAll();
    }

    public Optional<UserTable> getUserById(Long userId) {
        return userTableRepository.findById(userId);
    }

    public UserTable getUserByIdOrThrow(Long userId) {
        return userTableRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: " + userId
                ));
    }

    public Optional<UserTable> getUserByUsername(String username) {
        return userTableRepository.findByUsernameIgnoreCase(username);
    }

    public Optional<UserTable> getUserByEmail(String email) {
        return userTableRepository.findByEmailIgnoreCase(email);
    }

    public boolean existsByEmailIgnoreCase(String email){
        return userTableRepository.existsByEmailIgnoreCase(email);
    }

    public boolean existsByUsernameIgnoreCase(String username){
        return userTableRepository.existsByUsernameIgnoreCase(username);
    }

    public UserTable saveUser(UserTable user) {
        return userTableRepository.save(user);
    }

    public void deleteUser(UserTable user) {
        userTableRepository.delete(user);
    }

    public Optional<UserTable> findByUsernameAndPassword(String username, String rawPassword) {
        return userTableRepository.findByUsernameIgnoreCase(username)
                .filter(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()));
    }

    public UserTable getCurrentAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not authenticated"
            );
        }

        return userTableRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found"
                ));
    }
}
package com.testlink.webapp.userAuthentication.service;

import com.testlink.webapp.userAuthentication.entity.RegisterTable;
import com.testlink.webapp.userAuthentication.entity.TempUser;
import com.testlink.webapp.userAuthentication.repository.RegisterTableRepository;
import com.testlink.webapp.userAuthentication.repository.TempUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.testlink.webapp.config.HashingHelper.hashValue;

@Service
@RequiredArgsConstructor
public class TempUserService {

    private final TempUserRepository tempUserRepository;
    private final RegisterTableRepository registerTableRepository;
    private final PasswordEncoder passwordEncoder;

    public List<TempUser> getAllUsers() {
        return tempUserRepository.findAll();
    }

    public Optional<TempUser> getUserById(Long userId) {
        return tempUserRepository.findById(userId);
    }

    public Optional<TempUser> getUserByUsername(String username) {
        return tempUserRepository.findByUsername(username);
    }

    public Optional<TempUser> getUserByEmail(String email) {
        return tempUserRepository.findByEmail(email);
    }

    public TempUser saveUser(TempUser user) {
        return tempUserRepository.save(user);
    }

    public void deleteTempUser(TempUser tempUser) {
        tempUserRepository.delete(tempUser);
    }

    public String addUserWithPasswordAndRole(String username, String email, String password, String role) {

        // Remove existing temp users (cleanup before new registration)
        tempUserRepository.findByUsername(username).ifPresent(tempUserRepository::delete);
        tempUserRepository.findByEmail(email).ifPresent(tempUserRepository::delete);

        LocalDateTime now = LocalDateTime.now();

        TempUser user = TempUser.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .createdAt(now)
                .updatedAt(now)
                .build();

        tempUserRepository.save(user);

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashValue(rawToken.getBytes());

        RegisterTable registerTable = RegisterTable.builder()
                .tempUser(user)
                .registerToken(hashedToken)
                .createdAt(now)
                .expiredAt(now.plusHours(24))
                .build();

        registerTableRepository.save(registerTable);

        return rawToken;
    }
}
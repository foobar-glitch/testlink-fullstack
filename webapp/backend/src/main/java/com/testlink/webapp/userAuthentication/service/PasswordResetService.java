package com.testlink.webapp.userAuthentication.service;

import com.testlink.webapp.userAuthentication.dto.ResetPasswordRequestDTO;
import com.testlink.webapp.userAuthentication.entity.ResetTable;
import com.testlink.webapp.userAuthentication.entity.UserTable;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static com.testlink.webapp.config.HashingHelper.hashValue;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserTableService userTableService;
    private final ResetTableService resetTableService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Step 1: Create reset token (forgot password)
     */
    public String createResetToken(String email) {

        Optional<UserTable> optionalUser = userTableService.getUserByEmail(email);

        if (optionalUser.isEmpty()) {
            // You can also silently ignore for security reasons
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "E-Mail not found");
        }
        UserTable user = optionalUser.get();

        // delete existing tokens
        resetTableService.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashValue(rawToken.getBytes());

        ResetTable resetTable = new ResetTable();
        resetTable.setUser(user);
        resetTable.setResetToken(hashedToken);
        resetTable.setCreatedAt(LocalDateTime.now());
        resetTable.setExpiredAt(LocalDateTime.now().plusHours(24));

        resetTableService.save(resetTable);

        return rawToken; // send raw token to email / frontend
    }

    /**
     * Step 2: Validate token (optional endpoint)
     */
    public void validateToken(String rawToken) {

        String hashed = hashValue(rawToken.getBytes());

        ResetTable resetTable = resetTableService.findByResetToken(hashed)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token"));

        if (LocalDateTime.now().isAfter(resetTable.getExpiredAt())) {
            resetTableService.delete(resetTable);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token expired");
        }
    }

    /**
     * Step 3: Reset password
     */
    public void resetPassword(ResetPasswordRequestDTO dto) {

        if (!Objects.equals(dto.password(), dto.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        String hashed = hashValue(dto.resetToken().getBytes());

        ResetTable resetTable = resetTableService.findByResetToken(hashed)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token not found"));

        if (LocalDateTime.now().isAfter(resetTable.getExpiredAt())) {
            resetTableService.delete(resetTable);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token expired");
        }

        UserTable user = resetTable.getUser();
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setUpdatedAt(LocalDateTime.now());

        userTableService.saveUser(user);

        resetTableService.delete(resetTable);
    }
}
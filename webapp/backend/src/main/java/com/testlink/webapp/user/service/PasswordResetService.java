package com.testlink.webapp.user.service;

import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.shared.exception.ForbiddenException;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.shared.exception.UnauthorizedException;
import com.testlink.webapp.user.dto.ResetPasswordRequestDTO;
import com.testlink.webapp.user.entity.ResetTable;
import com.testlink.webapp.user.entity.UserTable;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static com.testlink.webapp.shared.util.HashingHelper.hashValue;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserService userService;
    private final ResetService resetService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Step 1: Create reset token (forgot password)
     */
    public String createResetToken(String email) {
        Optional<UserTable> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty()) {
            // Silent ignore for security reasons (don't leak user existence)
            // Still throw, but you could also return a dummy token.
            throw new ResourceNotFoundException("If the email exists, a reset link has been sent.");
        }

        UserTable user = optionalUser.get();

        // Delete existing tokens for this user
        resetService.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashValue(rawToken.getBytes());

        ResetTable resetTable = new ResetTable();
        resetTable.setUser(user);
        resetTable.setResetToken(hashedToken);
        resetTable.setCreatedAt(LocalDateTime.now());
        resetTable.setExpiredAt(LocalDateTime.now().plusHours(24));

        resetService.save(resetTable);

        return rawToken; // Send raw token via email / frontend
    }

    /**
     * Step 2: Validate token (optional endpoint)
     */
    public void validateToken(String rawToken) {
        String hashed = hashValue(rawToken.getBytes());

        ResetTable resetTable = resetService.findByResetToken(hashed)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        if (LocalDateTime.now().isAfter(resetTable.getExpiredAt())) {
            resetService.delete(resetTable);
            throw new ForbiddenException("Token expired");
        }
    }

    /**
     * Step 3: Reset password
     */
    public void resetPassword(ResetPasswordRequestDTO dto) {
        if (!Objects.equals(dto.password(), dto.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String hashed = hashValue(dto.resetToken().getBytes());

        ResetTable resetTable = resetService.findByResetToken(hashed)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired token"));

        if (LocalDateTime.now().isAfter(resetTable.getExpiredAt())) {
            resetService.delete(resetTable);
            throw new ForbiddenException("Token expired");
        }

        UserTable user = resetTable.getUser();
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setUpdatedAt(LocalDateTime.now());

        userService.saveUser(user);

        resetService.delete(resetTable);
    }
}
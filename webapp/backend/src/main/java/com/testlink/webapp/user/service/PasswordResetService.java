package com.testlink.webapp.user.service;

import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.shared.exception.ForbiddenException;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.shared.exception.UnauthorizedException;
import com.testlink.webapp.user.dto.ResetPasswordRequestDTO;
import com.testlink.webapp.user.entity.PasswordResetToken;
import com.testlink.webapp.user.entity.User;
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
        Optional<User> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty()) {
            // Silent ignore for security reasons (don't leak user existence)
            // Still throw, but you could also return a dummy token.
            throw new ResourceNotFoundException("If the email exists, a reset link has been sent.");
        }

        User user = optionalUser.get();

        // Delete existing tokens for this user
        resetService.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashValue(rawToken.getBytes());

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setResetToken(hashedToken);
        passwordResetToken.setCreatedAt(LocalDateTime.now());
        passwordResetToken.setExpiredAt(LocalDateTime.now().plusHours(24));

        resetService.save(passwordResetToken);

        return rawToken; // Send raw token via email / frontend
    }

    /**
     * Step 2: Validate token (optional endpoint)
     */
    public void validateToken(String rawToken) {
        String hashed = hashValue(rawToken.getBytes());

        PasswordResetToken passwordResetToken = resetService.findByResetToken(hashed)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        if (LocalDateTime.now().isAfter(passwordResetToken.getExpiredAt())) {
            resetService.delete(passwordResetToken);
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

        PasswordResetToken passwordResetToken = resetService.findByResetToken(hashed)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired token"));

        if (LocalDateTime.now().isAfter(passwordResetToken.getExpiredAt())) {
            resetService.delete(passwordResetToken);
            throw new ForbiddenException("Token expired");
        }

        User user = passwordResetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setUpdatedAt(LocalDateTime.now());

        userService.saveUser(user);

        resetService.delete(passwordResetToken);
    }
}
package com.testlink.webapp.user.service;

import com.testlink.webapp.user.entity.User;
import com.testlink.webapp.user.repository.PasswordResetToken;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResetService {

    private final PasswordResetToken passwordResetToken;

    public Optional<com.testlink.webapp.user.entity.PasswordResetToken> findByResetToken(String resetToken) {
        return passwordResetToken.findByResetToken(resetToken);
    }

    public com.testlink.webapp.user.entity.PasswordResetToken save(com.testlink.webapp.user.entity.PasswordResetToken passwordResetToken) {
        return this.passwordResetToken.save(passwordResetToken);
    }

    public void delete(@NonNull com.testlink.webapp.user.entity.PasswordResetToken passwordResetToken) {
        this.passwordResetToken.delete(passwordResetToken);
    }

    public void deleteByUser(@NonNull User user) {
        log.debug("Deleting reset tokens for user: {}", user.getUsername());
        List<com.testlink.webapp.user.entity.PasswordResetToken> tokens = passwordResetToken.findByUser(user);
        passwordResetToken.deleteAll(tokens);
    }
}
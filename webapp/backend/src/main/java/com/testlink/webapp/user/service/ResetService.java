package com.testlink.webapp.user.service;

import com.testlink.webapp.user.entity.PasswordResetToken;
import com.testlink.webapp.user.entity.User;
import com.testlink.webapp.user.repository.PasswordResetTokenRepository;
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

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public Optional<PasswordResetToken> findByResetToken(String resetToken) {
        return passwordResetTokenRepository.findByResetToken(resetToken);
    }

    public PasswordResetToken save(com.testlink.webapp.user.entity.PasswordResetToken passwordResetToken) {
        return this.passwordResetTokenRepository.save(passwordResetToken);
    }

    public void delete(@NonNull PasswordResetToken passwordResetToken) {
        this.passwordResetTokenRepository.delete(passwordResetToken);
    }

    public void deleteByUser(@NonNull User user) {
        log.debug("Deleting reset tokens for user: {}", user.getUsername());
        List<PasswordResetToken> tokens = passwordResetTokenRepository.findByUser(user);
        passwordResetTokenRepository.deleteAll(tokens);
    }
}
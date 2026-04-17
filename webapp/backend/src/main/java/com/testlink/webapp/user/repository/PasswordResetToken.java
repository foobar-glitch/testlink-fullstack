package com.testlink.webapp.user.repository;

import com.testlink.webapp.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetToken extends JpaRepository<com.testlink.webapp.user.entity.PasswordResetToken, Long> {
    Optional<com.testlink.webapp.user.entity.PasswordResetToken> findByResetToken(String resetToken);
    List<com.testlink.webapp.user.entity.PasswordResetToken> findByUser(User user);
}
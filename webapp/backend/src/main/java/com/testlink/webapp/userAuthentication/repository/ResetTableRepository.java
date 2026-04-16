package com.testlink.webapp.userAuthentication.repository;

import com.testlink.webapp.userAuthentication.entity.ResetTable;
import com.testlink.webapp.userAuthentication.entity.UserTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResetTableRepository extends JpaRepository<ResetTable, Long> {
    Optional<ResetTable> findByResetToken(String resetToken);
    List<ResetTable> findByUser(UserTable user);
}
package com.testlink.webapp.user.repository;

import com.testlink.webapp.user.entity.UserTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTableRepository extends JpaRepository<UserTable, Long> {
    Optional<UserTable> findByUsernameIgnoreCase(String username);
    Optional<UserTable> findByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
}
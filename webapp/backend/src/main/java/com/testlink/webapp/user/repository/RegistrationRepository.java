package com.testlink.webapp.user.repository;

import com.testlink.webapp.user.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    // Finding by hashed token
    Optional<Registration> findByRegisterToken(String registerToken);

}
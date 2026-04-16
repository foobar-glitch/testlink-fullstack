package com.testlink.webapp.userAuthentication.repository;

import com.testlink.webapp.userAuthentication.entity.RegisterTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegisterTableRepository extends JpaRepository<RegisterTable, Long> {
    // Finding by hashed token
    Optional<RegisterTable> findByRegisterToken(String registerToken);

}
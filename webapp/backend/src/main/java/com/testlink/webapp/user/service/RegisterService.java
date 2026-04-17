package com.testlink.webapp.user.service;


import com.testlink.webapp.user.entity.Registration;
import com.testlink.webapp.user.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterService {

    private final RegistrationRepository registrationRepository;

    public Optional<Registration> findByRegisterToken(String registerToken) {
        return registrationRepository.findByRegisterToken(registerToken);
    }

    public void deleteRegisterTable(Registration registration) {
        registrationRepository.delete(registration);
    }
}
package com.testlink.webapp.user.service;


import com.testlink.webapp.user.entity.RegisterTable;
import com.testlink.webapp.user.repository.RegisterTableRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterService {

    private final RegisterTableRepository registerTableRepository;

    public Optional<RegisterTable> findByRegisterToken(String registerToken) {
        return registerTableRepository.findByRegisterToken(registerToken);
    }

    public void deleteRegisterTable(RegisterTable registerTable) {
        registerTableRepository.delete(registerTable);
    }
}
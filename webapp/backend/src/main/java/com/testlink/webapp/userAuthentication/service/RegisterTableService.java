package com.testlink.webapp.userAuthentication.service;


import com.testlink.webapp.userAuthentication.entity.RegisterTable;
import com.testlink.webapp.userAuthentication.repository.RegisterTableRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterTableService {

    private final RegisterTableRepository registerTableRepository;

    public Optional<RegisterTable> findByRegisterToken(String registerToken) {
        return registerTableRepository.findByRegisterToken(registerToken);
    }

    public void deleteRegisterTable(RegisterTable registerTable) {
        registerTableRepository.delete(registerTable);
    }
}
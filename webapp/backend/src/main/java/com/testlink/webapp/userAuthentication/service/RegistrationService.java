package com.testlink.webapp.userAuthentication.service;

import com.testlink.webapp.userAuthentication.dto.RegisterUserDTO;
import com.testlink.webapp.userAuthentication.entity.RegisterTable;
import com.testlink.webapp.userAuthentication.entity.TempUser;
import com.testlink.webapp.userAuthentication.entity.UserTable;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static com.testlink.webapp.config.HashingHelper.hashValue;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final TempUserService tempUserService;
    private final UserTableService userTableService;
    private final RegisterTableService registerTableService;

    public String register(RegisterUserDTO dto) {

        if (!dto.password().equals(dto.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userTableService.existsByUsernameIgnoreCase(dto.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User exists");
        }

        if (userTableService.existsByEmailIgnoreCase(dto.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email exists");
        }

        return tempUserService.addUserWithPasswordAndRole(
                dto.username(),
                dto.email(),
                dto.password(),
                "ROLE_USER"
        );
    }

    public String validateToken(String token) {

        String lookupToken = hashValue(token.getBytes());

        RegisterTable registerTable = registerTableService.findByRegisterToken(lookupToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid token"));

        if (LocalDateTime.now().isAfter(registerTable.getExpiredAt())) {
            registerTableService.deleteRegisterTable(registerTable);
            tempUserService.deleteTempUser(registerTable.getTempUser());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token expired");
        }

        TempUser tempUser = registerTable.getTempUser();

        UserTable user = new UserTable();
        user.setEmail(tempUser.getEmail());
        user.setUsername(tempUser.getUsername());
        user.setPasswordHash(tempUser.getPasswordHash());
        user.setCreatedAt(tempUser.getCreatedAt());
        user.setUpdatedAt(tempUser.getUpdatedAt());
        user.addAuthority(tempUser.getRole());

        userTableService.saveUser(user);

        registerTableService.deleteRegisterTable(registerTable);
        tempUserService.deleteTempUser(tempUser);

        return "Account activated successfully!";
    }
}

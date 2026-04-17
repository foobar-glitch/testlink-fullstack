package com.testlink.webapp.user.service;

import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.shared.exception.ConflictException;
import com.testlink.webapp.shared.exception.ForbiddenException;
import com.testlink.webapp.user.dto.RegisterUserDTO;
import com.testlink.webapp.user.entity.RegisterTable;
import com.testlink.webapp.user.entity.TempUser;
import com.testlink.webapp.user.entity.UserTable;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static com.testlink.webapp.shared.util.HashingHelper.hashValue;


@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final TempUserService tempUserService;
    private final UserService userService;
    private final RegisterService registerService;

    public String register(RegisterUserDTO dto) {
        if (!dto.password().equals(dto.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userService.existsByUsernameIgnoreCase(dto.username())) {
            throw new ConflictException("Username already taken");
        }

        if (userService.existsByEmailIgnoreCase(dto.email())) {
            throw new ConflictException("Email already registered");
        }

        return tempUserService.addUserWithPasswordAndRole(
                dto.username(),
                dto.email(),
                dto.password(),
                "ROLE_USER"
        );
    }

    public void validateToken(String token) {
        String lookupToken = hashValue(token.getBytes());

        RegisterTable registerTable = registerService.findByRegisterToken(lookupToken)
                .orElseThrow(() -> new ForbiddenException("Invalid or expired token"));

        if (LocalDateTime.now().isAfter(registerTable.getExpiredAt())) {
            registerService.deleteRegisterTable(registerTable);
            tempUserService.deleteTempUser(registerTable.getTempUser());
            throw new ForbiddenException("Token has expired");
        }

        TempUser tempUser = registerTable.getTempUser();

        UserTable user = new UserTable();
        user.setEmail(tempUser.getEmail());
        user.setUsername(tempUser.getUsername());
        user.setPasswordHash(tempUser.getPasswordHash());
        user.setCreatedAt(tempUser.getCreatedAt());
        user.setUpdatedAt(tempUser.getUpdatedAt());
        user.addAuthority(tempUser.getRole());

        userService.saveUser(user);

        registerService.deleteRegisterTable(registerTable);
        tempUserService.deleteTempUser(tempUser);
    }

}
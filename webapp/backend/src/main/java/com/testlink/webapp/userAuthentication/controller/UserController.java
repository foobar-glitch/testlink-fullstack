package com.testlink.webapp.userAuthentication.controller;

import com.testlink.webapp.userAuthentication.dto.UserTableDTO;
import com.testlink.webapp.userAuthentication.mapper.UserMapper;
import com.testlink.webapp.userAuthentication.service.UserTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserTableService userTableService;
    private final UserMapper userMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/username/{userId}")
    public ResponseEntity<UserTableDTO> getUsername(@PathVariable Long userId) {
        return userTableService.getUserById(userId)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}
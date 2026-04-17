package com.testlink.webapp.user.controller;


import com.testlink.webapp.shared.dto.ApiResponse;
import com.testlink.webapp.user.dto.RegisterTokenDTO;
import com.testlink.webapp.user.dto.RegisterUserDTO;
import com.testlink.webapp.user.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth/register")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegisterUserDTO dto) {
        String token = registrationService.register(dto);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Check your email for activation token: " + token)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestBody RegisterTokenDTO dto) {
        registrationService.validateToken(dto.registerToken());
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Account activated successfully!")
                .build();
        return ResponseEntity.ok(response);
    }
}
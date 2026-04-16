package com.testlink.webapp.userAuthentication.controller;


import com.testlink.webapp.config.dto.ApiResponse;
import com.testlink.webapp.userAuthentication.dto.RegisterTokenDTO;
import com.testlink.webapp.userAuthentication.dto.RegisterUserDTO;
import com.testlink.webapp.userAuthentication.service.RegistrationService;
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
        return ResponseEntity.ok(
                new ApiResponse<>("Check your email for activation token: " + token, true, null));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestBody RegisterTokenDTO dto) {
        String result = registrationService.validateToken(dto.registerToken());
        return ResponseEntity.ok(new ApiResponse<>(result, true, null));
    }
}
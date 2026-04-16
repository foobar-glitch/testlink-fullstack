package com.testlink.webapp.userAuthentication.controller;

import com.testlink.webapp.config.dto.ApiResponse;
import com.testlink.webapp.userAuthentication.dto.ForgotRequestDTO;
import com.testlink.webapp.userAuthentication.dto.ResetPasswordRequestDTO;
import com.testlink.webapp.userAuthentication.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/forgot")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/send-to-mail")
    public ResponseEntity<ApiResponse<Void>> forgot(@RequestBody ForgotRequestDTO dto) {
        passwordResetService.createResetToken(dto.email());
        return ResponseEntity.ok(new ApiResponse<>("Reset email sent", true, null));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestParam String resetToken) {
        passwordResetService.validateToken(resetToken);
        return ResponseEntity.ok(new ApiResponse<>("Token valid", true, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> reset(@RequestBody ResetPasswordRequestDTO dto) {
        passwordResetService.resetPassword(dto);
        return ResponseEntity.ok(new ApiResponse<>("Password reset successful", true, null));
    }
}
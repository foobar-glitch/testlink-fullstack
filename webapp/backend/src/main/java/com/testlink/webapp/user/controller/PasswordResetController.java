package com.testlink.webapp.user.controller;

import com.testlink.webapp.shared.dto.ApiResponse;
import com.testlink.webapp.user.dto.ForgotRequestDTO;
import com.testlink.webapp.user.dto.ResetPasswordRequestDTO;
import com.testlink.webapp.user.service.PasswordResetService;
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
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Reset email sent")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestParam String resetToken) {
        passwordResetService.validateToken(resetToken);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Token Valid")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> reset(@RequestBody ResetPasswordRequestDTO dto) {
        passwordResetService.resetPassword(dto);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Password reset successful")
                .build();

        return ResponseEntity.ok(response);
    }
}
package com.testlink.webapp.userAuthentication.controller;


import com.testlink.webapp.userAuthentication.dto.AuthResponse;
import com.testlink.webapp.userAuthentication.dto.LoginRequestDTO;
import com.testlink.webapp.userAuthentication.dto.UserTableDTO;
import com.testlink.webapp.userAuthentication.entity.CustomUserDetails;
import com.testlink.webapp.userAuthentication.mapper.UserMapper;
import com.testlink.webapp.userAuthentication.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequestDTO dto,
                                              HttpServletRequest request) {

        AuthResponse response = authService.login(dto);

        request.getSession(true)
                .setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        SecurityContextHolder.getContext());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication) {

        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }

        return ResponseEntity.ok(authService.logout(request, response, authentication));
    }

    @GetMapping("/me")
    public ResponseEntity<UserTableDTO> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userMapper.toDto(userDetails.getUser()));
    }
}
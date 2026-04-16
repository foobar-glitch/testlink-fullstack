package com.testlink.webapp.userAuthentication.service;

import com.testlink.webapp.userAuthentication.dto.AuthResponse;
import com.testlink.webapp.userAuthentication.dto.LoginRequestDTO;
import com.testlink.webapp.userAuthentication.mapper.AuthResponseMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AuthResponseMapper authMapper;

    public AuthResponse login(LoginRequestDTO dto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.username(),
                        dto.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String username = authentication.getName();
        Set<String> roles = authMapper.mapRoles(authentication.getAuthorities());

        return authMapper.toResponse(username, roles);
    }

    public AuthResponse logout(HttpServletRequest request,
                               HttpServletResponse response,
                               Authentication authentication) {

        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }

        SecurityContextHolder.clearContext();

        return new AuthResponse(
                "Logout successful",
                null,
                null
        );
    }
}
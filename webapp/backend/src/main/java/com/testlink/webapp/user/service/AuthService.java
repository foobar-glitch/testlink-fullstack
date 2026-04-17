package com.testlink.webapp.user.service;

import com.testlink.webapp.user.dto.AuthResponse;
import com.testlink.webapp.user.dto.LoginRequestDTO;
import com.testlink.webapp.user.dto.UserTableDTO;
import com.testlink.webapp.user.entity.CustomUserDetails;
import com.testlink.webapp.user.entity.UserTable;
import com.testlink.webapp.user.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    public AuthResponse login(LoginRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.username(),
                        dto.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails principal =
                (CustomUserDetails) authentication.getPrincipal();

        UserTable user = principal.getUser();
        UserTableDTO userDto = userMapper.toDto(user);

        return new AuthResponse(
                "Login successful",
                userDto
        );
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
                null
        );
    }

    public UserTableDTO getCurrentUser(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        return userMapper.toDto(userDetails.getUser());
    }
}
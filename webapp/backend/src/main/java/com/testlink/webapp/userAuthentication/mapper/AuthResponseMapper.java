package com.testlink.webapp.userAuthentication.mapper;

import com.testlink.webapp.userAuthentication.dto.AuthResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthResponseMapper {

    public AuthResponse toResponse(String username, Set<String> roles) {
        return new AuthResponse(
                "Login successful",
                username,
                roles
        );
    }

    public Set<String> mapRoles(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}

package com.testlink.webapp.config;

import com.testlink.webapp.user.entity.CustomUserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    /**
     * Hot-swaps the current session's authorities without requiring a logout.
     */
    public void refreshSession(CustomUserDetails userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && userDetails != null) {
            UsernamePasswordAuthenticationToken newAuth = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    auth.getCredentials(),
                    userDetails.getAuthorities() // Grabs the fresh roles from the User object
            );
            SecurityContextHolder.getContext().setAuthentication(newAuth);
        }
    }
}
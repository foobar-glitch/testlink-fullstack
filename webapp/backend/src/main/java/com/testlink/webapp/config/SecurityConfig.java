package com.testlink.webapp.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC: Allow the base path AND sub-paths
                        .requestMatchers(
                                "/auth/**", "/users/**"
                        ).permitAll()

                        //.requestMatchers("/cart/**").authenticated()
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                // 3. Disable default login forms for API use
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 4. Modern Logout Configuration
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .logoutSuccessHandler((req, res, auth) -> {
                            res.setStatus(HttpServletResponse.SC_OK);
                            res.getWriter().write("Logout successful");
                            res.getWriter().flush();
                        })
                );

        return http.build();
    }

    // 3. Define the CORS configuration bean here
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public RoleHierarchy roleHierarchy() {
        StringBuilder myHierarchy = new StringBuilder();

        List<String> authoritiesTests = List.of("TEST_CREATE", "TEST_READ", "TEST_UPDATE", "TEST_DELETE");
        List<String> authoritiesCategories = List.of("CATEGORY_CREATE", "CATEGORY_READ", "CATEGORY_UPDATE", "CATEGORY_DELETE");

        // Pro-Tip: Make ADMIN inherit from USER once, so you don't repeat yourself
        myHierarchy.append("ROLE_ADMIN > ROLE_TESTER\n");

        // Everything both Admin and User can do
        for (String auth : authoritiesTests) {
            myHierarchy.append(String.format("ROLE_USER > %s\n", auth));
        }
        for (String auth : authoritiesCategories) {
            myHierarchy.append(String.format("ROLE_USER > %s\n", auth));
        }
        // Everything only Admin can do
        /*
        for (String auth : authoritiesProducts) {
            myHierarchy.append(String.format("ROLE_ADMIN > %s\n", auth));
        }
        */

        return RoleHierarchyImpl.fromHierarchy(myHierarchy.toString());
    }

}
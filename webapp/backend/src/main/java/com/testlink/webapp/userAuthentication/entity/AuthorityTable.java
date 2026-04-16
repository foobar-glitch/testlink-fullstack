package com.testlink.webapp.userAuthentication.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "authorities",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "authority"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorityTable implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "authority_id")
    private Long authorityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserTable user;

    @Column(name = "authority", nullable = false, length = 50)
    private String authority;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Override
    public String getAuthority() {
        return this.authority;
    }

    // Komfort-Konstruktor
    public AuthorityTable(UserTable user, String authority) {
        this.user = user;
        this.authority = authority;
    }

}
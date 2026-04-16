package com.testlink.webapp.userAuthentication.entity;

import com.testlink.webapp.config.entitiy.TimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

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
public class AuthorityTable extends TimeStampedEntity implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "authority_id")
    private Long authorityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserTable user;

    @Column(name = "authority", nullable = false, length = 50)
    private String authority;

    // =========================
    // SPRING SECURITY
    // =========================

    @Override
    public String getAuthority() {
        return this.authority;
    }

    // =========================
    // CONVENIENCE CONSTRUCTOR
    // =========================

    public AuthorityTable(UserTable user, String authority) {
        this.user = user;
        this.authority = authority;
    }
}
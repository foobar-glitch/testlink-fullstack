package com.testlink.webapp.user.entity;

import com.testlink.webapp.shared.entity.TimeStampedEntity;
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
public class Authority extends TimeStampedEntity implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "authority_id")
    private Long authorityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    public Authority(User user, String authority) {
        this.user = user;
        this.authority = authority;
    }
}
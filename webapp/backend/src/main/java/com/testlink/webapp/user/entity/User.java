package com.testlink.webapp.user.entity;

import com.testlink.webapp.shared.entity.TimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends TimeStampedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "public_uuid", nullable = false)
    private UUID publicId;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Builder.Default
    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    private Set<Authority> authorities = new HashSet<>();

    // business methods

    public void addAuthority(String roleName) {
        this.authorities.add(new Authority(this, roleName));
    }

    public void deleteAuthority(String roleName) {
        this.authorities.removeIf(a -> a.getAuthority().equals(roleName));
    }
}
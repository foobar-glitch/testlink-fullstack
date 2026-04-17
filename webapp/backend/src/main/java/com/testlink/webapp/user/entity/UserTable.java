package com.testlink.webapp.user.entity;

import com.testlink.webapp.shared.entity.TimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTable extends TimeStampedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

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
    private Set<AuthorityTable> authorities = new HashSet<>();

    // business methods

    public void addAuthority(String roleName) {
        this.authorities.add(new AuthorityTable(this, roleName));
    }

    public void deleteAuthority(String roleName) {
        this.authorities.removeIf(a -> a.getAuthority().equals(roleName));
    }
}
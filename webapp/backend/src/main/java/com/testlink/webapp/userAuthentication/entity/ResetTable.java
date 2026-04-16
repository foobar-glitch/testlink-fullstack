package com.testlink.webapp.userAuthentication.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "reset_table",
        uniqueConstraints = @UniqueConstraint(columnNames = "reset_token")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetTable extends TimeStampedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reset_id")
    private Long resetId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserTable user;

    @Column(name = "reset_token", nullable = false, length = 255, unique = true)
    private String resetToken;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
}
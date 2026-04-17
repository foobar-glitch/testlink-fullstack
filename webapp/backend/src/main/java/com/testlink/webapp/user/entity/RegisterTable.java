package com.testlink.webapp.user.entity;

import com.testlink.webapp.shared.entity.TimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "register_table")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterTable extends TimeStampedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "register_id")
    private Long registerId;

    @ManyToOne
    @JoinColumn(name = "temp_user_id", nullable = false)
    private TempUser tempUser;

    @Column(name = "register_token", nullable = false, unique = true)
    private String registerToken;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
}
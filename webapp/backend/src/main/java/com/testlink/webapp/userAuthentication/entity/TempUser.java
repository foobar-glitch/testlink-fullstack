package com.testlink.webapp.userAuthentication.entity;

import com.testlink.webapp.config.entitiy.TimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "temp_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TempUser extends TimeStampedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tempUserId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String role;
}
package com.testlink.webapp.shared.entity;

import com.testlink.webapp.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class UserCreatedTimeStampedEntity extends TimeStampedEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}

package com.testlink.webapp.config.entitiy;

import com.testlink.webapp.userAuthentication.entity.UserTable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class UserCreatedTimeStampedEntity extends TimeStampedEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserTable createdBy;
}

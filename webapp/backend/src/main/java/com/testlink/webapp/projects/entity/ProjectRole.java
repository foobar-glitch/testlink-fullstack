package com.testlink.webapp.projects.entity;

import lombok.Getter;

@Getter
public enum ProjectRole {
    VIEWER(1), TESTER(2), ADMIN(3);

    private final int level;

    ProjectRole(int level) {
        this.level = level;
    }

    public boolean hasAtLeast(ProjectRole requiredRole) {
        return this.level >= requiredRole.level;
    }
}

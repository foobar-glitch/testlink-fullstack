package com.testlink.webapp.shared.exception;

import com.testlink.webapp.projects.entity.ProjectRole;
import org.springframework.http.HttpStatus;

public class InsufficientAuthorityException extends BaseException {

    public InsufficientAuthorityException(Long userId, Long projectId, ProjectRole required, ProjectRole actual) {
        super("User %d has role %s but requires %s for project %d"
                .formatted(userId, actual, required, projectId));
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.FORBIDDEN;
    }
}
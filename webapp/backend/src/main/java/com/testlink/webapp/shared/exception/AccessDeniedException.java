package com.testlink.webapp.shared.exception;

import org.springframework.http.HttpStatus;

public class AccessDeniedException extends BaseException {

    public AccessDeniedException(Long userId, Long projectId) {
        super("User %d does not have access to project %d"
                .formatted(userId, projectId));
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.FORBIDDEN;
    }
}
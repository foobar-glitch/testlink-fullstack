-- =========================
-- PROJECT MEMBERSHIPS TABLE
-- =========================
CREATE TABLE project_memberships (
                                     membership_id BIGSERIAL PRIMARY KEY,
                                     project_id BIGINT NOT NULL,
                                     user_id BIGINT NOT NULL,
                                     role VARCHAR(20) NOT NULL,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                     CONSTRAINT fk_project_memberships_project
                                         FOREIGN KEY (project_id)
                                             REFERENCES projects(project_id)
                                             ON DELETE CASCADE,
                                     CONSTRAINT fk_project_memberships_user
                                         FOREIGN KEY (user_id)
                                             REFERENCES users(user_id)
                                             ON DELETE CASCADE,
                                     CONSTRAINT uk_project_membership
                                         UNIQUE (project_id, user_id),
                                     CONSTRAINT chk_project_role
                                         CHECK (role IN ('ADMIN', 'TESTER', 'VIEWER'))
);

COMMENT ON TABLE project_memberships IS 'Associates users with projects and their role within that project';
COMMENT ON COLUMN project_memberships.role IS 'Project-level role: ADMIN, TESTER, or VIEWER';

-- Indexes for performance
CREATE INDEX idx_project_memberships_project ON project_memberships(project_id);
CREATE INDEX idx_project_memberships_user ON project_memberships(user_id);
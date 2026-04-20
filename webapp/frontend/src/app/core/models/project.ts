// ─── Project ─────────────────────────────────────────────────────────────────
import { Authentication } from './authentication';
import { UserCreatedTimeStamp } from './tablemetadata';

export interface Project {
  projectId: string;
  projectKey: string;
  displayName: string;
  description: string;
  status: string;
  stamp: UserCreatedTimeStamp;
}

export type ProjectRole = 'admin' | 'tester' | 'viewer';

export interface ProjectMembership {
  user: Authentication;
  project: Project;
  role: ProjectRole;
}

export interface ProjectStats {
  suiteCount: number;
  testCaseCount: number;
  testRunCount: number;
}

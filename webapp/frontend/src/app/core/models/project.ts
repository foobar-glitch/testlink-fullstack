// ─── Project ─────────────────────────────────────────────────────────────────
import { UserSummary } from './authentication';
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
  user: UserSummary;
  project: Project;
  role: ProjectRole;
}
// TODO projectStats like testCaseStats
// SuiteStats
export interface ProjectStats {
  suiteCount: number;
  testCaseCount: number;
  testRunCount: number;
}

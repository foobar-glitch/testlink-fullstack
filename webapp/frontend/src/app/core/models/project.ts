// ─── Project ─────────────────────────────────────────────────────────────────
import { UserSummary } from './authentication';
import { UserCreatedTimeStamp } from './tablemetadata';
import { TestRunStatus } from './testexecution';

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
  totalTestSuites: number;
  totalTestPlans: number;
  totalTestCases: number;
  totalExecutions: number;
  lastExecutionStatus: TestRunStatus | null;
  lastExecutedAt: string | null;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  notRunCount: number;
  startsUpdatedAt: string; // note: backend field name is "startsUpdatedAt" (typo, but keep same)
}

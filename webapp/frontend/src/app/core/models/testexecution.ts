// ─── Test Run ────────────────────────────────────────────────────────────────
import { TestCase, TestCaseVersion } from './testsuite';
import { UserCreatedTimeStamp } from './tablemetadata';
import { Project } from './project';
import { UserSummary } from './authentication';

export interface TestPlan {
  testPlanId: string;
  project: Project;
  name: string;
  description: string;
  stamp: UserCreatedTimeStamp;
}

export interface TestPlanRun {
  testPlanRunId: string;
  testPlan: TestPlan;
  name: string;
  environment: string;
  build: string;
  stamp: UserCreatedTimeStamp;
}

export type ExecutionStatus = 'pass' | 'fail' | 'blocked' | 'not_run';

export type TestRunStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

export interface TestPlanRunItem {
  testRunItemId: string;
  testPlanRun: TestPlanRun;
  testCase: TestCase;
  testCaseVersion: TestCaseVersion;
  assignedTo: UserSummary | null;
  executedBy: UserSummary | null;
  status: TestRunStatus;
  executedAt: string | null;
  notes: string | null;
  stamp: UserCreatedTimeStamp;
}

//TODO RunSummary
/*
export interface TestRun {
  id: number;
  projectId: number;
  name: string;
  description: string;
  suiteId: number | null;
  suiteName: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  summary: RunSummary;
}

export interface RunSummary {
  total: number;
  pass: number;
  fail: number;
  blocked: number;
  notRun: number;
}

export interface TestExecution {
  id: number;
  runId: number;
  testCaseId: number;
  testCase: TestCase;
  status: ExecutionStatus;
  notes: string;
  executedBy: string | null;
  executedAt: string | null;
}

export interface ExecutionUpdateRequest {
  status: ExecutionStatus;
  notes?: string;
}
*/

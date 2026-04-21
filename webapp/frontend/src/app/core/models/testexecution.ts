// ─── testexecution.ts ────────────────────────────────────────────────────────
import { UserCreatedTimeStampDTO } from './shared';
import { TestCase, TestCaseVersion } from './testsuite';

// ── Test Plan ─────────────────────────────────────────────────────────────────

export interface TestPlan {
  testPlanId:   string;
  name:         string;
  description?: string;
  stamp:        UserCreatedTimeStampDTO;
}

// ── Test Plan Run ─────────────────────────────────────────────────────────────

export interface TestPlanRun {
  testPlanRunId: string;
  name:          string;
  build?:        string;
  environment?:  string;
  stamp:         UserCreatedTimeStampDTO;
}

// ── Test Plan Run Item ────────────────────────────────────────────────────────

export type TestRunStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

export interface TestPlanRunItem {
  testRunItemId:   string;
  status:          TestRunStatus;
  notes?:          string;
  testCase:        TestCase;
  testCaseVersion: TestCaseVersion;
  testPlanRun:     TestPlanRun;
  assignedTo?:     { username: string };
  executedBy?:     { username: string };
  executedAt?:     string;
  stamp:           UserCreatedTimeStampDTO;
}

// ── Test Step Result ──────────────────────────────────────────────────────────

export type ExecutionStatus = 'pass' | 'fail' | 'blocked' | 'not_run';

export interface TestStepResult {
  testStepResultId: string;
  status:           TestRunStatus;
  actualResult?:    string;
  notes?:           string;
  testRunItem:      TestPlanRunItem;
  stamp:            UserCreatedTimeStampDTO;
}

// ── Test Case Version Step (for step-result views) ────────────────────────────

export interface TestCaseVersionStep {
  stepId:         string;
  stepNumber:     number;
  stepAction:     string;
  expectedResult: string;
}

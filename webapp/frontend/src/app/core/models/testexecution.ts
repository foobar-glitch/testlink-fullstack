// ─── Test Run ────────────────────────────────────────────────────────────────
import { TestCase } from './testsuite';

export type ExecutionStatus = 'pass' | 'fail' | 'blocked' | 'not_run';

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

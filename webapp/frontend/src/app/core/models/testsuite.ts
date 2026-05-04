// ─── testsuite.ts ─────────────────────────────────────────────────────────────
// Extends the existing models with fields required by the test-explorer UI.

import { UserCreatedTimeStamp } from './tablemetadata';
import { Project } from './project';
import { TestRunStatus } from './testexecution';
// ─── Test Suite ──────────────────────────────────────────────────────────────

/**
 * TestSuiteItem mirrors the backend's TestSuiteItemDTO exactly.
 * It intentionally has NO `children` or `expanded` field —
 * those are assembled client-side into a TestSuite tree node.
 */
export interface TestSuiteItem {
  testSuiteId: string;
  name: string;
  description: string;
  project: Project;
  stamp: UserCreatedTimeStamp;
}

/**
 * TestSuiteHierarchyDTO shape returned by the backend.
 * `parent` is null for root suites.
 * `children` is a flat list of direct children (TestSuiteItem, not yet tree nodes).
 */
export interface TestSuiteHierarchyDTO {
  current: TestSuiteItem;
  parent: TestSuiteItem | null;
  children: TestSuiteHierarchyDTO[];
  testCases: TestCase[];          // <-- add this
}

/**
 * TestSuite is the client-side tree node, built from TestSuiteHierarchyDTO.
 * `children` is always present after buildTree (never undefined).
 * `expanded` is UI-only state.
 */
export interface TestSuite extends TestSuiteItem {
  children: TestSuite[];
  expanded: boolean;
  testCases?: TestCase[];
}


export type TestCaseStatus = 'draft' | 'active' | 'deprecated';
export type TestCasePriority = 'low' | 'medium' | 'high';
// ─── Test Case ───────────────────────────────────────────────────────────────
export interface TestCase {
  testCaseId: string;
  testSuite: TestSuiteItem;
  identifierNumber: number;
  title: string;
  description: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  stamp: UserCreatedTimeStamp;
}

export type PriorityFilter = 'any' | TestCasePriority;

export interface TestCaseFilter {
  priority: PriorityFilter;
}

export interface TestCasePlanStats {
  testCaseId: string;          // UUID as string
  testPlanId: string;          // UUID as string
  totalExecutions: number;
  lastExecutionStatus: TestRunStatus | null;
  lastExecutedAt: string | null;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  notRunCount: number;
  statsUpdatedAt: string;
}

export type TestCaseVersionStatus = 'draft' | 'active' | 'deprecated';

export interface TestCaseVersionPlanStats {
  testCaseVersionId: string;   // UUID as string
  testPlanId: string;          // UUID as string
  totalExecutions: number;
  lastExecutionStatus: TestRunStatus | null;
  lastExecutedAt: string | null;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  notRunCount: number;
  statsUpdatedAt: string;
}

export interface TestCaseVersion {
  testCaseVersionId: string;
  testCase: TestCase;
  versionNumber: number;
  status: TestCaseVersionStatus;
  stamp: UserCreatedTimeStamp;
}

export interface TestStep {
  order: number;
  action: string;
  expectedResult: string;
}

export interface TestCaseVersionContent {
  testCaseVersionId: string;
  testCaseVersion: TestCaseVersion;
  title: string;
  preconditions: string;
  expectedResult: string;
  stamp: UserCreatedTimeStamp;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high';
  suiteId: number;
}

export interface TestSuitePlanStats {
  testSuiteId: string,
  testPlanId: string,
  totalChildSuites: number;
  totalTestCases: number;
  totalExecutions: number;
  lastExecutionStatus: TestRunStatus | null;
  lastExecutedAt: string | null;  // ISO date string
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  notRunCount: number;
  startsUpdatedAt: string;  // ISO date string
}


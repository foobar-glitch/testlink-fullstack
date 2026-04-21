// ─── testsuite.ts ─────────────────────────────────────────────────────────────
// Extends the existing models with fields required by the test-explorer UI.

import { UserCreatedTimeStamp } from './tablemetadata';
import { Project } from './project';
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
  children: TestSuiteItem[];
}

/**
 * TestSuite is the client-side tree node, built from TestSuiteHierarchyDTO.
 * `children` is always present after buildTree (never undefined).
 * `expanded` is UI-only state.
 */
export interface TestSuite extends TestSuiteItem {
  children: TestSuite[]; // always populated, never undefined
  expanded: boolean; // UI state only
}

/**
 * TestSuiteHierarchy is the enriched client-side version used by detail views.
 * All three fields use the full TestSuite tree node type.
 */
export interface TestSuiteHierarchy {
  current: TestSuite;
  parent: TestSuite | null;
  children: TestSuite[];
}

export type TestCaseStatus = 'draft' | 'active' | 'deprecated';

// ─── Test Case ───────────────────────────────────────────────────────────────
export interface TestCase {
  testCaseId: string;
  testSuite: TestSuiteItem;
  identifierNumber: number;
  title: string;
  description: string;
  status: TestCaseStatus;
  stamp: UserCreatedTimeStamp;
}

export type TestCaseVersionStatus = 'draft' | 'active' | 'deprecated';

export interface TestCaseVersion {
  testCaseVersionId: string;
  testCase: TestCase;
  versionNumber: number;
  status: TestCaseVersionStatus;
  stam: UserCreatedTimeStamp;
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

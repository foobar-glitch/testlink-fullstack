// ─── testsuite.ts ─────────────────────────────────────────────────────────────
// Extends the existing models with fields required by the test-explorer UI.

import { UserCreatedTimeStampDTO } from './shared';

export interface TestSuiteItem {
  testSuiteId: string;
  name: string;
  description?: string;
}

export interface TestSuiteHierarchyDTO {
  current: TestSuiteItem;
  parent: TestSuiteItem | null;
  children: TestSuiteItem[];
}

export interface TestSuiteHierarchy {
  current: TestSuite;
  parent: TestSuite | null;
  children: TestSuite[];
}

export interface TestSuite extends TestSuiteItem {
  project?: {
    projectKey: string;
    displayName: string;
  };
  children: TestSuite[];
  expanded: boolean;
}

// ── Test Case ─────────────────────────────────────────────────────────────────

export type TestCaseStatus = 'draft' | 'active' | 'deprecated';
export type TestCasePriority = 'high' | 'medium' | 'low';

export interface TestCase {
  testCaseId:        string;
  identifierNumber:  number;
  title:             string;
  description?:      string;
  status:            TestCaseStatus;
  priority?:         TestCasePriority;
  testSuite:         TestSuite & {
    project?: { projectKey: string; displayName: string };
  };
  stamp:             UserCreatedTimeStampDTO;
}

// ── Test Case Version ─────────────────────────────────────────────────────────

export interface TestCaseVersion {
  testCaseVersionId: string;
  versionNumber:     number;
  status:            TestCaseStatus;
  testCase:          TestCase;
  stamp:             UserCreatedTimeStampDTO;
}

// ── Test Case Version Content ─────────────────────────────────────────────────

export interface TestCaseVersionContent {
  contentId:  string;
  summary?:   string;
  preconditions?: string;
  testCaseVersion: TestCaseVersion;
  stamp:      UserCreatedTimeStampDTO;
}

// ── Test Case Version Step ────────────────────────────────────────────────────

export interface TestCaseVersionStep {
  stepId:         string;
  stepNumber:     number;
  stepAction:     string;
  expectedResult: string;
  testCaseVersionContent: TestCaseVersionContent;
  stamp:          UserCreatedTimeStampDTO;
}

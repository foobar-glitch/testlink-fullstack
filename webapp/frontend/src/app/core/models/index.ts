// ─── Auth ───────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface UserSummary{
  userId: number;
  username: string
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface TimeStamp {
  createdAt: string;
  updatedAt: string;
}

export interface UserCreatedTimeStamp {
  user: UserSummary;
  timeStamp: TimeStamp;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  projectId: number;
  projectKey: string;
  displayName: string;
  description: string;
  status: string;
  stamp: UserCreatedTimeStamp;
}

export type ProjectRole = 'admin' | 'tester' | 'viewer';

export interface ProjectMembership {
  user: User;
  project: Project;
  role: ProjectRole;
}

export interface ProjectStats {
  suiteCount: number;
  testCaseCount: number;
  testRunCount: number;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

/**
 * TestSuiteItem mirrors the backend's TestSuiteItemDTO exactly.
 * It intentionally has NO `children` or `expanded` field —
 * those are assembled client-side into a TestSuite tree node.
 */
export interface TestSuiteItem {
  testSuiteId: number;
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
  children: TestSuite[];   // always populated, never undefined
  expanded: boolean;       // UI state only
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
  testCaseId: number;
  project: Project;
  testSuite: TestSuiteItem;
  identifierNumber: number;
  title: string;
  description: string;
  status: TestCaseStatus;
  stamp: UserCreatedTimeStamp;
}

export interface TestStep {
  order: number;
  action: string;
  expectedResult: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high';
  suiteId: number;
}

// ─── Test Run ────────────────────────────────────────────────────────────────
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

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PageRequest {
  page: number;
  pageSize: number;
  search?: string;
  suiteId?: number;
  status?: string;
}

// ─── API Response wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

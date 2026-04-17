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

export interface AuthResponse {
  message: string;
  user: User;
}

export interface TimeStamp {
  createdAt: string;
  updatedAt: string;
}
export interface UserCreatedTimeStamp{
  user: User;
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
  //TODO
  //stats: ProjectStats;
}

export type ProjectRole = 'admin' | 'tester' | 'viewer';

export interface ProjectMembership{
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
export interface TestSuite {
  testSuiteId: number;
  name: string;
  description: string;
  project: Project;
  stamp: UserCreatedTimeStamp;
  children?: TestSuite[];          // now always populated from backend
  expanded?: boolean;              // UI state only
}

export interface TestSuiteHierarchy {
  current: TestSuite;
  parent: TestSuite | null;
  children: TestSuite[];
}
// ─── Test Case ───────────────────────────────────────────────────────────────
export interface TestCase {
  id: number;
  suiteId: number;
  projectId: number;
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'draft' | 'deprecated';
  version: number;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
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
  message?: string;      // optional, backend may omit
  timestamp?: string;    // add this if you want to use it
}


import { Authentication } from '../models/authentication';
import { Project } from '../models/project';
import { TestCase, TestSuite } from '../models/testsuite';
import { ExecutionStatus, RunSummary, TestExecution, TestRun } from '../models/testexecution';

// ─── Users ──────────────────────────────────────────────────────────────────
/*
export const MOCK_USERS: Authentication[] = [
  { id: 1, username: 'admin', email: 'admin@testflow.dev', role: 'admin' },
  { id: 2, username: 'tester1', email: 'tester1@testflow.dev', role: 'tester' },
  { id: 3, username: 'tester2', email: 'tester2@testflow.dev', role: 'tester' },
];
*/

// ─── Projects ────────────────────────────────────────────────────────────────
/*
const MOCK_PROJECTS: Project[] = [
  {
    id: 1, name: 'E-Commerce Platform', prefix: 'ECP',
    description: 'Frontend & backend testing for the main shopping platform.',
    createdAt: '2024-01-15T09:00:00Z',
    stats: { suiteCount: 12, testCaseCount: 148, testRunCount: 34 }
  },
  {
    id: 2, name: 'Mobile App iOS', prefix: 'IOS',
    description: 'iOS native app test suite covering all user journeys.',
    createdAt: '2024-02-01T10:00:00Z',
    stats: { suiteCount: 8, testCaseCount: 92, testRunCount: 21 }
  },
  {
    id: 3, name: 'API Gateway', prefix: 'AGW',
    description: 'REST API integration and contract tests.',
    createdAt: '2024-03-10T08:00:00Z',
    stats: { suiteCount: 5, testCaseCount: 67, testRunCount: 15 }
  },
  {
    id: 4, name: 'Admin Dashboard', prefix: 'ADM',
    description: 'Internal admin panel UI and permission tests.',
    createdAt: '2024-04-05T11:00:00Z',
    stats: { suiteCount: 6, testCaseCount: 54, testRunCount: 9 }
  },
];
*/

/*
// ─── Test Suites ─────────────────────────────────────────────────────────────
export const MOCK_SUITES: TestSuite[] = [
  // Project 1
  { id: 1, projectId: 1, parentId: null, name: 'Authentication', description: 'Login, register, session tests', childCount: 2, testCaseCount: 18 },
  { id: 2, projectId: 1, parentId: 1,    name: 'Login Flow', description: '', childCount: 0, testCaseCount: 10 },
  { id: 3, projectId: 1, parentId: 1,    name: 'Registration', description: '', childCount: 0, testCaseCount: 8 },
  { id: 4, projectId: 1, parentId: null, name: 'Product Catalog', description: 'Browse, search, filter products', childCount: 3, testCaseCount: 32 },
  { id: 5, projectId: 1, parentId: 4,    name: 'Search', description: '', childCount: 0, testCaseCount: 12 },
  { id: 6, projectId: 1, parentId: 4,    name: 'Filters', description: '', childCount: 0, testCaseCount: 10 },
  { id: 7, projectId: 1, parentId: 4,    name: 'Product Detail', description: '', childCount: 0, testCaseCount: 10 },
  { id: 8, projectId: 1, parentId: null, name: 'Checkout', description: 'Cart, payment, order confirmation', childCount: 2, testCaseCount: 25 },
  { id: 9, projectId: 1, parentId: 8,    name: 'Cart Management', description: '', childCount: 0, testCaseCount: 12 },
  { id: 10, projectId: 1, parentId: 8,   name: 'Payment Flow', description: '', childCount: 0, testCaseCount: 13 },
  // Project 2
  { id: 11, projectId: 2, parentId: null, name: 'Onboarding', description: 'First-run experience', childCount: 0, testCaseCount: 15 },
  { id: 12, projectId: 2, parentId: null, name: 'Home Feed', description: 'Main feed tests', childCount: 0, testCaseCount: 22 },
  // Project 3
  { id: 13, projectId: 3, parentId: null, name: 'Auth Endpoints', description: '', childCount: 0, testCaseCount: 18 },
  { id: 14, projectId: 3, parentId: null, name: 'Products API', description: '', childCount: 0, testCaseCount: 24 },
];
*/

/*
// ─── Test Cases ──────────────────────────────────────────────────────────────
const makeSteps = (actions: string[]): import('../models').TestStep[] =>
  actions.map((action, i) => ({ order: i + 1, action, expectedResult: `Expected result for step ${i + 1}` }));

export const MOCK_TEST_CASES: TestCase[] = [
  // Suite 2 – Login Flow
  { id: 1, suiteId: 2, projectId: 1, title: 'Valid credentials login', description: 'Verify user can log in with correct username and password.', priority: 'high', status: 'active', version: 3, assignedTo: 'tester1', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-03-01T14:00:00Z', expectedResult: 'Authentication is redirected to dashboard after successful login.', steps: makeSteps(['Navigate to /login', 'Enter valid username "admin"', 'Enter valid password', 'Click Sign In button']) },
  { id: 2, suiteId: 2, projectId: 1, title: 'Invalid password shows error', description: 'Verify error message appears for wrong password.', priority: 'high', status: 'active', version: 2, assignedTo: 'tester1', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-03-01T14:00:00Z', expectedResult: 'Error message "Invalid credentials" is shown.', steps: makeSteps(['Navigate to /login', 'Enter valid username', 'Enter wrong password', 'Click Sign In']) },
  { id: 3, suiteId: 2, projectId: 1, title: 'Empty fields validation', description: 'Verify form shows validation when fields are empty.', priority: 'medium', status: 'active', version: 1, assignedTo: null, createdAt: '2024-01-21T10:00:00Z', updatedAt: '2024-02-10T14:00:00Z', expectedResult: 'Required field errors shown for username and password.', steps: makeSteps(['Navigate to /login', 'Leave all fields empty', 'Click Sign In button']) },
  { id: 4, suiteId: 2, projectId: 1, title: 'Remember me persists session', description: 'Verify session persists when remember me is checked.', priority: 'low', status: 'active', version: 1, assignedTo: 'tester2', createdAt: '2024-01-22T09:00:00Z', updatedAt: '2024-02-11T10:00:00Z', expectedResult: 'Authentication remains logged in after browser restart.', steps: makeSteps(['Navigate to /login', 'Enter credentials', 'Check "Remember me"', 'Click Sign In', 'Close and reopen browser', 'Navigate to app']) },
  { id: 5, suiteId: 2, projectId: 1, title: 'Logout clears session', description: 'Verify logging out invalidates the session cookie.', priority: 'high', status: 'active', version: 2, assignedTo: 'tester1', createdAt: '2024-01-23T09:00:00Z', updatedAt: '2024-03-05T11:00:00Z', expectedResult: 'Cookie is cleared and user is redirected to login.', steps: makeSteps(['Log in successfully', 'Click user avatar', 'Click Logout', 'Verify redirect to /login']) },
  { id: 6, suiteId: 2, projectId: 1, title: 'Locked account handling', description: 'Verify appropriate message shown for locked accounts.', priority: 'medium', status: 'active', version: 1, assignedTo: null, createdAt: '2024-01-24T09:00:00Z', updatedAt: '2024-02-15T10:00:00Z', expectedResult: 'Message states account is locked with support contact.', steps: makeSteps(['Navigate to /login', 'Enter credentials for locked account', 'Click Sign In']) },
  { id: 7, suiteId: 2, projectId: 1, title: 'SQL injection prevention', description: 'Verify login is not vulnerable to basic SQL injection.', priority: 'high', status: 'active', version: 1, assignedTo: 'tester1', createdAt: '2024-01-25T09:00:00Z', updatedAt: '2024-02-20T10:00:00Z', expectedResult: 'Login fails gracefully without server error.', steps: makeSteps(['Navigate to /login', "Enter \" OR 1=1-- as username", 'Enter any password', 'Click Sign In']) },
  { id: 8, suiteId: 2, projectId: 1, title: 'Forgot password link present', description: 'Verify forgot password link is visible on login page.', priority: 'low', status: 'active', version: 1, assignedTo: null, createdAt: '2024-01-26T09:00:00Z', updatedAt: '2024-02-01T10:00:00Z', expectedResult: '"Forgot password?" link navigates to reset page.', steps: makeSteps(['Navigate to /login', 'Locate "Forgot password?" link', 'Click the link']) },
  { id: 9, suiteId: 2, projectId: 1, title: 'Redirect to originally requested URL', description: 'Verify user is redirected to original page after login.', priority: 'medium', status: 'active', version: 2, assignedTo: 'tester2', createdAt: '2024-01-27T09:00:00Z', updatedAt: '2024-03-02T10:00:00Z', expectedResult: 'Authentication arrives at the originally requested URL.', steps: makeSteps(['Navigate to /app/dashboard while logged out', 'Get redirected to /login', 'Log in with valid credentials']) },
  { id: 10, suiteId: 2, projectId: 1, title: 'HTTPS enforcement on login', description: 'Verify login page is only served over HTTPS.', priority: 'high', status: 'draft', version: 1, assignedTo: null, createdAt: '2024-01-28T09:00:00Z', updatedAt: '2024-01-28T09:00:00Z', expectedResult: 'HTTP requests are redirected to HTTPS automatically.', steps: makeSteps(['Access http:// (non-SSL) login URL', 'Observe network response']) },
  // Suite 5 – Search
  { id: 11, suiteId: 5, projectId: 1, title: 'Basic keyword search returns results', description: 'Verify search returns relevant products.', priority: 'high', status: 'active', version: 2, assignedTo: 'tester1', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-03-10T14:00:00Z', expectedResult: 'Products matching keyword are displayed in results.', steps: makeSteps(['Navigate to /search', 'Type "laptop" in search bar', 'Press Enter or click search']) },
  { id: 12, suiteId: 5, projectId: 1, title: 'No results shows empty state', description: 'Verify empty state UI appears when no results found.', priority: 'medium', status: 'active', version: 1, assignedTo: null, createdAt: '2024-02-02T10:00:00Z', updatedAt: '2024-02-15T14:00:00Z', expectedResult: '"No products found" message with suggestions shown.', steps: makeSteps(['Navigate to /search', 'Type "xyzinvalidproduct123"', 'Press Enter']) },
  { id: 13, suiteId: 5, projectId: 1, title: 'Search suggestions appear on type', description: 'Verify typeahead suggestions appear after 2 characters.', priority: 'medium', status: 'active', version: 1, assignedTo: 'tester2', createdAt: '2024-02-03T10:00:00Z', updatedAt: '2024-02-20T14:00:00Z', expectedResult: 'Dropdown with up to 5 suggestions appears.', steps: makeSteps(['Focus on search input', 'Type 2 characters', 'Observe suggestions dropdown']) },
  // Suite 9 – Cart
  { id: 14, suiteId: 9, projectId: 1, title: 'Add item to cart', description: 'Verify item is added and cart count updates.', priority: 'high', status: 'active', version: 3, assignedTo: 'tester1', createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-03-15T14:00:00Z', expectedResult: 'Cart badge increments and item appears in cart drawer.', steps: makeSteps(['Navigate to product detail page', 'Click "Add to Cart"', 'Observe cart icon badge', 'Open cart drawer']) },
  { id: 15, suiteId: 9, projectId: 1, title: 'Remove item from cart', description: 'Verify item removal updates total correctly.', priority: 'high', status: 'active', version: 2, assignedTo: 'tester1', createdAt: '2024-02-11T10:00:00Z', updatedAt: '2024-03-15T14:00:00Z', expectedResult: 'Item is removed and order total is recalculated.', steps: makeSteps(['Add item to cart', 'Open cart', 'Click remove button on item', 'Verify total updates']) },
  { id: 16, suiteId: 9, projectId: 1, title: 'Cart persists on page refresh', description: 'Verify cart contents are maintained after page reload.', priority: 'medium', status: 'active', version: 1, assignedTo: null, createdAt: '2024-02-12T10:00:00Z', updatedAt: '2024-02-25T14:00:00Z', expectedResult: 'Cart items remain after hard refresh of page.', steps: makeSteps(['Add multiple items to cart', 'Hard refresh page (Ctrl+Shift+R)', 'Open cart drawer']) },
];

// ─── Test Runs ────────────────────────────────────────────────────────────────
export const MOCK_TEST_RUNS: TestRun[] = [
  {
    id: 1, projectId: 1, name: 'Sprint 12 – Regression', description: 'Full regression after Sprint 12 release', suiteId: 2, suiteName: 'Login Flow',
    createdAt: '2024-04-01T09:00:00Z', updatedAt: '2024-04-02T16:00:00Z', createdBy: 'admin',
    summary: { total: 10, pass: 7, fail: 2, blocked: 1, notRun: 0 }
  },
  {
    id: 2, projectId: 1, name: 'Hotfix – Checkout Bug', description: 'Targeted testing after checkout hotfix', suiteId: 9, suiteName: 'Cart Management',
    createdAt: '2024-04-05T10:00:00Z', updatedAt: '2024-04-05T14:00:00Z', createdBy: 'tester1',
    summary: { total: 6, pass: 3, fail: 1, blocked: 0, notRun: 2 }
  },
  {
    id: 3, projectId: 1, name: 'Sprint 13 – Search Module', description: 'New search feature acceptance tests', suiteId: 5, suiteName: 'Search',
    createdAt: '2024-04-10T09:00:00Z', updatedAt: '2024-04-10T09:00:00Z', createdBy: 'admin',
    summary: { total: 3, pass: 0, fail: 0, blocked: 0, notRun: 3 }
  },
];

// ─── Test Executions ─────────────────────────────────────────────────────────
export const MOCK_EXECUTIONS: TestExecution[] = [
  // Run 1 – Login Flow (suite 2, tc 1–10)
  { id: 1,  runId: 1, testCaseId: 1,  testCase: MOCK_TEST_CASES[0],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-02T10:00:00Z' },
  { id: 2,  runId: 1, testCaseId: 2,  testCase: MOCK_TEST_CASES[1],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-02T10:10:00Z' },
  { id: 3,  runId: 1, testCaseId: 3,  testCase: MOCK_TEST_CASES[2],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-02T10:20:00Z' },
  { id: 4,  runId: 1, testCaseId: 4,  testCase: MOCK_TEST_CASES[3],  status: 'pass',    notes: '', executedBy: 'admin',   executedAt: '2024-04-02T11:00:00Z' },
  { id: 5,  runId: 1, testCaseId: 5,  testCase: MOCK_TEST_CASES[4],  status: 'fail',    notes: 'Cookie not cleared on logout in Safari', executedBy: 'tester1', executedAt: '2024-04-02T11:15:00Z' },
  { id: 6,  runId: 1, testCaseId: 6,  testCase: MOCK_TEST_CASES[5],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-02T11:30:00Z' },
  { id: 7,  runId: 1, testCaseId: 7,  testCase: MOCK_TEST_CASES[6],  status: 'fail',    notes: 'Server returns 500 on injection attempt', executedBy: 'tester1', executedAt: '2024-04-02T12:00:00Z' },
  { id: 8,  runId: 1, testCaseId: 8,  testCase: MOCK_TEST_CASES[7],  status: 'pass',    notes: '', executedBy: 'admin',   executedAt: '2024-04-02T12:15:00Z' },
  { id: 9,  runId: 1, testCaseId: 9,  testCase: MOCK_TEST_CASES[8],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-02T12:30:00Z' },
  { id: 10, runId: 1, testCaseId: 10, testCase: MOCK_TEST_CASES[9],  status: 'blocked', notes: 'Needs DevOps to configure HTTPS redirect first', executedBy: 'admin', executedAt: '2024-04-02T13:00:00Z' },
  // Run 2 – Cart (suite 9, tc 14–16)
  { id: 11, runId: 2, testCaseId: 14, testCase: MOCK_TEST_CASES[13], status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-05T11:00:00Z' },
  { id: 12, runId: 2, testCaseId: 15, testCase: MOCK_TEST_CASES[14], status: 'fail',    notes: 'Total does not update when currency is EUR', executedBy: 'tester1', executedAt: '2024-04-05T11:20:00Z' },
  { id: 13, runId: 2, testCaseId: 16, testCase: MOCK_TEST_CASES[15], status: 'pass',    notes: '', executedBy: 'admin',   executedAt: '2024-04-05T11:30:00Z' },
  { id: 14, runId: 2, testCaseId: 1,  testCase: MOCK_TEST_CASES[0],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-05T12:00:00Z' },
  { id: 15, runId: 2, testCaseId: 2,  testCase: MOCK_TEST_CASES[1],  status: 'pass',    notes: '', executedBy: 'tester1', executedAt: '2024-04-05T12:10:00Z' },
  { id: 16, runId: 2, testCaseId: 3,  testCase: MOCK_TEST_CASES[2],  status: 'not_run', notes: '', executedBy: null,      executedAt: null },
  { id: 17, runId: 2, testCaseId: 4,  testCase: MOCK_TEST_CASES[3],  status: 'not_run', notes: '', executedBy: null,      executedAt: null },
  // Run 3 – Search (suite 5, tc 11–13)
  { id: 18, runId: 3, testCaseId: 11, testCase: MOCK_TEST_CASES[10], status: 'not_run', notes: '', executedBy: null, executedAt: null },
  { id: 19, runId: 3, testCaseId: 12, testCase: MOCK_TEST_CASES[11], status: 'not_run', notes: '', executedBy: null, executedAt: null },
  { id: 20, runId: 3, testCaseId: 13, testCase: MOCK_TEST_CASES[12], status: 'not_run', notes: '', executedBy: null, executedAt: null },
];
*/

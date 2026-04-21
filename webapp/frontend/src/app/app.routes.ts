import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public ───────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // ── Authenticated shell (topbar + sidebar + router-outlet) ────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [

      // Default → explorer
      { path: '', redirectTo: 'explorer', pathMatch: 'full' },

      // ── TestLink-style main page ──────────────────────────────────────────
      {
        path: 'explorer',
        loadComponent: () =>
          import('./features/test-explorer/test-explorer.component').then(
            m => m.TestExplorerComponent,
          ),
      },

      // ── Dashboard (your new component) ───────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            m => m.DashboardComponent,
          ),
      },

      // ── Projects ─────────────────────────────────────────────────────────
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component').then(
            m => m.ProjectListComponent,
          ),
      },

      // ── Test Suites ───────────────────────────────────────────────────────
      {
        path: 'projects/project-key/:projectKey/suites',
        loadComponent: () =>
          import('./features/test-management/test-suites/test-suite-list/test-suite-list.component').then(
            m => m.TestSuiteListComponent,
          ),
      },

      // ── Test Cases ────────────────────────────────────────────────────────
      {
        path: 'projects/project-key/:projectKey/suites/:suiteId/testcases',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-case-list/test-case-list.component').then(
            m => m.TestCaseListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/suites/:suiteId/testcases/:testCaseIdentifier/versions',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-case-version-list/test-case-version-list.component').then(
            m => m.TestCaseVersionListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/suite/:suiteId/testcase-identifier/:testCaseIdentifier/versions/:versionNumber/content',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-case-version-content/test-case-version-content.component').then(
            m => m.TestCaseVersionContentComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/suite/:suiteId/testcase-identifier/:testCaseIdentifier/versions/:versionNumber/content/steps',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-step-result-list/test-step-result-list.component').then(
            m => m.TestStepResultListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/suite/:suiteId/testcase-identifier/:testCaseIdentifier/versions/:versionNumber/content/steps/:stepId/action',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-step-result-list/test-step-result-list.component').then(
            m => m.TestStepResultListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/suite/:suiteId/testcase-identifier/:testCaseIdentifier/versions/:versionNumber/content/steps/:stepId/action/:actionId',
        loadComponent: () =>
          import('./features/test-management/test-cases/test-step-result-detail/test-step-result-detail.component').then(
            m => m.TestStepResultDetailComponent,
          ),
      },

      // ── Test Plans ────────────────────────────────────────────────────────
      {
        path: 'projects/project-key/:projectKey/testplans',
        loadComponent: () =>
          import('./features/test-management/test-plans/test-plan-list/test-plan-list.component').then(
            m => m.TestPlanListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/testplans/:testPlanId/runs',
        loadComponent: () =>
          import('./features/test-management/test-plans/test-plan-run-list/test-plan-run-list.component').then(
            m => m.TestPlanRunListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/testplans/:testPlanId/runs/:testRunId/items',
        loadComponent: () =>
          import('./features/test-management/test-plans/test-plan-run-item-list/test-plan-run-item-list.component').then(
            m => m.TestPlanRunItemListComponent,
          ),
      },
      {
        path: 'projects/project-key/:projectKey/testplans/:testPlanId/runs/:testRunId/items/:itemId',
        loadComponent: () =>
          import('./features/test-management/test-plans/test-plan-run-item-detail/test-plan-run-item-detail.component').then(
            m => m.TestPlanRunItemDetailComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

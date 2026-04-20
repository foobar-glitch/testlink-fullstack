import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { TestCaseListComponent } from './features/test-cases/test-case-list/test-case-list.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'projects/project-key/:projectKey',
    canActivate: [authGuard],
    children: [
      { path: 'suites', loadComponent: () => import('./features/test-suites/test-suite-list/test-suite-list.component').then(m => m.TestSuiteListComponent) },
      {
        path: 'suites/:suiteId/testcases',
        loadComponent: () => import('./features/test-cases/test-case-list/test-case-list.component').then(m => m.TestCaseListComponent)
      },
      {
        path: 'suites/:suiteId/testcases/:testCaseIdentifier/versions',
        loadComponent: () => import('./features/test-cases/test-case-version-list/test-case-version-list.component').then(m => m.TestCaseVersionListComponent)
      },
      {
        path: 'suites/:suiteId/testcases/:testCaseIdentifier/versions/:versionNumber/content',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/test-cases/test-case-version-content/test-case-version-content.component').then(
            m => m.TestCaseVersionContentComponent
          ),
      },
      {
        path: 'suites/:suiteId/testcases/:testCaseIdentifier/versions/:versionNumber/steps/:stepId/action',
        canActivate: [authGuard],
        loadComponent: () => import('./features/test-cases/test-step-result-list/test-step-result-list.component').then(m => m.TestStepResultListComponent),
      },
      {
        path: 'suites/:suiteId/testcases/:testCaseIdentifier/versions/:versionNumber/steps/:stepId/action/:actionId',
        canActivate: [authGuard],
        loadComponent: () => import('./features/test-cases/test-step-result-detail/test-step-result-detail.component').then(m => m.TestStepResultDetailComponent)
        },
      { path: 'testplans', loadComponent: () => import('./features/test-plans/test-plan-list/test-plan-list.component').then(m => m.TestPlanListComponent) },
      { path: 'testplans/:testPlanId/runs', loadComponent: () => import('./features/test-plans/test-plan-run-list/test-plan-run-list.component').then(m => m.TestPlanRunListComponent) },
      {
        path: 'testplans/:testPlanId/runs/:testRunId/items',
        loadComponent: () => import('./features/test-plans/test-plan-run-item-list/test-plan-run-item-list.component').then(m => m.TestPlanRunItemListComponent),
      },
      {
        path: 'testplans/:testPlanId/runs/:testRunId/items/:itemId',
        canActivate: [authGuard],
        loadComponent: () => import('./features/test-plans/test-plan-run-item-detail/test-plan-run-item-detail.component').then(m => m.TestPlanRunItemDetailComponent),
      },

  { path: '', redirectTo: 'suites', pathMatch: 'full' },
      { path: '', redirectTo: 'suites', pathMatch: 'full' }
    ]
  },
  {
    path: 'projects/project-key/:projectKey/testplans/:testPlanId/runs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/test-plans/test-plan-run-list/test-plan-run-list.component').then(
        m => m.TestPlanRunListComponent
      ),
  },
  // { path: 'projects/project-key/:projectKey/testcase-identifier/:testCaseIdentifier/versions', redirectTo: 'projects/project-key/:projectKey/suites/:suiteId/testcases/:testCaseIdentifier/versions' },
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', redirectTo: '/projects' }
];

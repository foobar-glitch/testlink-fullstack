import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },

  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
  },

  {
    path: 'projects/:projectId',
    canActivate: [authGuard],
    children: [
      { path: 'suites', loadComponent: () => import('./features/test-suites/test-suite-list/test-suite-list.component').then(m => m.TestSuiteListComponent) },
      { path: 'suites/:suiteId/cases', loadComponent: () => import('./features/test-cases/test-case-list/test-case-list.component').then(m => m.TestCaseListComponent) },
      { path: '', redirectTo: 'suites', pathMatch: 'full' }
    ]
  },

  // New simplified version history route
  {
    path: 'testcase/:projectKey/:testCaseIdentifier/versions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test-cases/test-case-version-list/test-case-version-list.component').then(m => m.TestCaseVersionListComponent)
  },

  // Optional: route for viewing a specific version (if you add a detail page later)
  // {
  //   path: 'testcase/:projectKey-:testCaseIdentifier/version/:versionNumber',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/test-cases/test-case-version-detail/test-case-version-detail.component').then(m => m.TestCaseVersionDetailComponent)
  // },

  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', redirectTo: '/projects' }
];

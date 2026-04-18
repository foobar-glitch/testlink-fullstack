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
    path: 'projects/project-key/:projectKey',
    canActivate: [authGuard],
    children: [
      { path: 'suites', loadComponent: () => import('./features/test-suites/test-suite-list/test-suite-list.component').then(m => m.TestSuiteListComponent) },
      { path: 'suites/:suiteId/cases', loadComponent: () => import('./features/test-cases/test-case-list/test-case-list.component').then(m => m.TestCaseListComponent) },
      { path: '', redirectTo: 'suites', pathMatch: 'full' }
    ]
  },
  {
    path: 'projects/project-key/:projectKey/testcase-identifier/:testCaseIdentifier/versions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test-cases/test-case-version-list/test-case-version-list.component').then(m => m.TestCaseVersionListComponent)
  },
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', redirectTo: '/projects' }
];

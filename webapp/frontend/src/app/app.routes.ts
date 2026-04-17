import { Routes } from '@angular/router';
import { authGuard, projectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  {
    path: 'projects/:projectId',
    canActivate: [authGuard],
    children: [
      { path: 'suites', loadComponent: () => import('./features/test-suites/test-suite-list/test-suite-list.component').then(m => m.TestSuiteListComponent) },
      { path: '', redirectTo: 'suites', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/projects' }
];

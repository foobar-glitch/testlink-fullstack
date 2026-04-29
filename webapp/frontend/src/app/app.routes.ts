import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { TestPlanRunItemDetailComponent } from './features/test-plan/test-plan-run-items/test-plan-run-items.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./features/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'desktop', pathMatch: 'full' },
      {
        path: 'desktop',
        loadComponent: () => import('./features/desktop/desktop.component').then(m => m.DesktopComponent),
      },
      {
        path: 'explorer',
        loadComponent: () => import('./features/execution/execution-shell/execution-shell.component').then(m => m.ExecutionShellComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/execution/execution-view/execution-view.component').then(m => m.ExecutionViewComponent),
          },
        ],
      },
      {
        path: 'requirements',
        loadComponent: () => import('./features/not-implemented/not-implemented.component').then(m => m.NotImplementedComponent),
        data: { label: 'Requirements' },
      },
      {
        path: 'specification',
        loadComponent: () => import('./features/not-implemented/not-implemented.component').then(m => m.NotImplementedComponent),
        data: { label: 'Test Specification' },
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/not-implemented/not-implemented.component').then(m => m.NotImplementedComponent),
        data: { label: 'Test Reports' },
      },
      {
        path: 'test-plans',
        loadComponent: () => import('./features/test-plan/test-plan-list/test-plan-list.component').then(m => m.TestPlanListComponent),
        canActivate: [authGuard],
        data: { label: 'Test Plans' },
      },
      {
        path: 'test-plans/detail',
        loadComponent: () => import('./features/test-plan/test-plan-detail/test-plan-detail.component').then(m => m.TestPlanDetailComponent),
        canActivate: [authGuard],
      },
      {
        path: 'test-plans/run-items',
        loadComponent: () => import('./features/test-plan/test-plan-run-items/test-plan-run-items.component').then(m => m.TestPlanRunItemDetailComponent),
        canActivate: [authGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/execution-layout/execution-layout.component').then(m => m.ExecutionLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/execution-view/execution-view.component').then(m => m.ExecutionViewComponent),
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
    ],
  },
  { path: '**', redirectTo: '' },
];

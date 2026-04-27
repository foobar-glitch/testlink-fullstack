import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public ─────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // ── Authenticated shell (topbar + sidebar + router-outlet) ─────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Default → desktop
      { path: '', redirectTo: 'desktop', pathMatch: 'full' },

      // ── Desktop (home / dashboard) ─────────────────────────────────────────
      {
        path: 'desktop',
        loadComponent: () =>
          import('./features/desktop/desktop.component').then(m => m.DesktopComponent),
      },

      // ── Test Explorer ──────────────────────────────────────────────────────
      {
        path: 'explorer',
        loadComponent: () =>
          import('./features/test-explorer/test-explorer.component').then(
            m => m.TestExplorerComponent,
          ),
      },

      // ── Requirements (not yet implemented – placeholder) ───────────────────
      {
        path: 'requirements',
        loadComponent: () =>
          import('./features/not-implemented/not-implemented.component').then(
            m => m.NotImplementedComponent,
          ),
        data: { label: 'Requirements' },
      },

      // ── Test Specification (not yet implemented – placeholder) ─────────────
      {
        path: 'specification',
        loadComponent: () =>
          import('./features/not-implemented/not-implemented.component').then(
            m => m.NotImplementedComponent,
          ),
        data: { label: 'Test Specification' },
      },

      // ── Test Reports (not yet implemented – placeholder) ───────────────────
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/not-implemented/not-implemented.component').then(
            m => m.NotImplementedComponent,
          ),
        data: { label: 'Test Reports' },
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];

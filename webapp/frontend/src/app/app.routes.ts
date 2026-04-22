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
      // Default → explorer
      { path: '', redirectTo: 'explorer', pathMatch: 'full' },

      // ── Main Test Explorer (handles all views via query params) ────────────
      {
        path: 'explorer',
        loadComponent: () =>
          import('./features/test-explorer/test-explorer.component').then(
            m => m.TestExplorerComponent,
          ),
      },

      // ── Projects list (optional, can be kept or moved into explorer) ───────
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component').then(
            m => m.ProjectListComponent,
          ),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];

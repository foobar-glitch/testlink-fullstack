// ─── app-header.component.ts ─────────────────────────────────────────────────
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { Authentication } from '../../../core/models/authentication';

interface Crumb { label: string; link: string | null; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: Authentication | null = null;
  breadcrumbs: Crumb[] = [];

  get initials(): string {
    const u = this.currentUser?.username ?? '';
    return u.slice(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    // Track current user
    this.auth.currentUser$.subscribe(u => (this.currentUser = u));

    // Build breadcrumbs on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs(this.router.url));

    // Build once on load
    this.buildBreadcrumbs(this.router.url);
  }

  logout(): void {
    this.auth.logout();
  }

  private buildBreadcrumbs(url: string): void {
    // Simple label map for known path segments
    const labels: Record<string, string> = {
      projects: 'Projects',
      suites:   'Test Suites',
      testcases:'Test Cases',
      versions: 'Versions',
      login:    'Login',
    };

    const parts = url.split('/').filter(Boolean);
    const crumbs: Crumb[] = [];
    let path = '';

    for (const part of parts) {
      path += '/' + part;
      const label = labels[part] ?? (part.includes('-') ? part : null);
      if (label) {
        crumbs.push({ label, link: path });
      }
    }

    // Last crumb is current page — no link
    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1].link = null;
    }

    this.breadcrumbs = crumbs;
  }
}

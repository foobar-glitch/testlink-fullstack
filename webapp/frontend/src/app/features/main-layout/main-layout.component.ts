import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, catchError, filter, startWith, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { ContextService } from '../../core/services/context.service';
import { Authentication } from '../../core/models/authentication';
import { ProjectMembership } from '../../core/models/project';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly projects = inject(ProjectService);
  private readonly ctx = inject(ContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  currentUser: Authentication | null = null;

  get initials(): string {
    return (this.currentUser?.username ?? '').slice(0, 2).toUpperCase();
  }

  memberships$: Observable<ProjectMembership[]> = of([]);
  selectedProjectKey = '';

  ngOnInit(): void {
    // User
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      });

    // Memberships for project dropdown
    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() => this.projects.getProjectMemberships().pipe(catchError(() => of([])))),
      startWith([])
    );

    // Sync URL → selectedProjectKey + ContextService
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const key = params['project'] || '';
        if (key !== this.selectedProjectKey) {
          this.selectedProjectKey = key;
          this.ctx.setProject(key);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { project: key, plan: null, suite: null, testcase: null, version: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  logout(): void {
    this.auth.logout();
  }
}

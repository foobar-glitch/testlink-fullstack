import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  Subscription,
  of,
  combineLatest,
} from 'rxjs';
import {
  switchMap,
  catchError,
  filter,
  map,
  distinctUntilChanged,
  startWith,
  tap,
} from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { TestSuiteService } from '../../core/services/test-suite.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { ContextService } from '../../core/services/context.service';
import { TreeStateService } from '../../core/services/tree-state.service';

import { Authentication } from '../../core/models/authentication';
import { ProjectMembership } from '../../core/models/project';
import { TestSuite } from '../../core/models/testsuite';
import { TestPlan } from '../../core/models/testexecution';

import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SuiteTreeNodeComponent } from '../test-explorer/test-tree-node/suite-tree-node.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SpinnerComponent,
    SuiteTreeNodeComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly auth    = inject(AuthService);
  private readonly projects = inject(ProjectService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly plansSvc  = inject(TestPlanService);
  private readonly ctx       = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly router    = inject(Router);
  private readonly cdr       = inject(ChangeDetectorRef);

  // ── Auth ──────────────────────────────────────────────────────────────
  currentUser: Authentication | null = null;

  get initials(): string {
    return (this.currentUser?.username ?? '').slice(0, 2).toUpperCase();
  }

  // ── Context selectors ─────────────────────────────────────────────────
  selectedProjectKey: string = '';
  selectedPlanId: string     = '';

  memberships$: Observable<ProjectMembership[]> = of([]);
  testPlans$: Observable<TestPlan[]>             = of([]);

  // ── Sidebar tree ──────────────────────────────────────────────────────
  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  suiteLoading$: Observable<boolean> = this._suiteLoading$.asObservable();

  allSuites: TestSuite[]       = [];
  filteredSuites: TestSuite[]  = [];
  treeSearch: string           = '';

  // ── Sidebar visibility ────────────────────────────────────────────────
  showSidebar = true;

  private subs = new Subscription();

  ngOnInit(): void {
    // Track current user
    this.subs.add(
      this.auth.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      }),
    );

    // Load projects when user is ready
    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() =>
        this.projects.getProjectMemberships().pipe(catchError(() => of([]))),
      ),
      startWith([]),
    );

    // Restore context from session
    const savedCtx = this.ctx.snapshot;
    if (savedCtx.projectKey) {
      this.selectedProjectKey = savedCtx.projectKey;
      this.loadSuites(savedCtx.projectKey);
      this.loadPlans(savedCtx.projectKey);
    }
    if (savedCtx.testPlanId) {
      this.selectedPlanId = savedCtx.testPlanId;
    }

    // Show/hide sidebar depending on route
    this.subs.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          this.showSidebar = this.router.url.startsWith('/explorer');
          this.cdr.markForCheck();
        }),
    );
    this.showSidebar = this.router.url.startsWith('/explorer');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Context change handlers ───────────────────────────────────────────
  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.selectedProjectKey = key;
    this.selectedPlanId     = '';
    this.ctx.setProject(key);
    this.treeState.clearSelection();
    this.loadSuites(key);
    this.loadPlans(key);
    this.router.navigate(['/explorer']);
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedPlanId = id;
    this.ctx.setPlan(id);
    this.treeState.clearSelection();
    this.router.navigate(['/explorer']);
  }

  refresh(): void {
    if (this.selectedProjectKey) {
      this.loadSuites(this.selectedProjectKey);
      if (this.selectedPlanId) this.ctx.setPlan(this.selectedPlanId);
    }
    this.router.navigate(['/explorer']);
  }

  goToExecution(): void {
    this.router.navigate(['/explorer'], { queryParams: { view: 'execution' } });
  }

  logout(): void {
    this.auth.logout();
  }

  // ── Tree controls ─────────────────────────────────────────────────────
  expandAll(): void {
    this.treeState.expandAll(this.allSuites);
    this.cdr.markForCheck();
  }

  collapseAll(): void {
    this.treeState.collapseAll();
    this.cdr.markForCheck();
  }

  onSearchChange(query: string): void {
    this.filteredSuites = query.trim()
      ? this.filterSuites(this.allSuites, query.toLowerCase())
      : this.allSuites;
    this.cdr.markForCheck();
  }

  // ── Private helpers ───────────────────────────────────────────────────
  private loadSuites(projectKey: string): void {
    this._suiteLoading$.next(true);
    this.suitesSvc
      .getTestSuitesByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe(suites => {
        this.allSuites     = suites;
        this.filteredSuites = suites;
        this._suiteLoading$.next(false);
        this.cdr.markForCheck();
      });
  }

  private loadPlans(projectKey: string): void {
    this.testPlans$ = this.plansSvc
      .getTestPlansByProjectKey(projectKey)
      .pipe(catchError(() => of([])));
  }

  private filterSuites(suites: TestSuite[], q: string): TestSuite[] {
    return suites.reduce<TestSuite[]>((acc, s) => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const childMatches = this.filterSuites(s.children ?? [], q);
      if (nameMatch || childMatches.length) {
        acc.push({ ...s, children: childMatches.length ? childMatches : s.children });
      }
      return acc;
    }, []);
  }
}

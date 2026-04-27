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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  of,
  Subject,
} from 'rxjs';
import {
  switchMap,
  catchError,
  filter,
  startWith,
  takeUntil,
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

export type SidebarFrame = 'settings' | 'filters' | 'explorer';

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
  private readonly auth      = inject(AuthService);
  private readonly projects  = inject(ProjectService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly plansSvc  = inject(TestPlanService);
  private readonly ctx       = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly router    = inject(Router);
  private readonly cdr       = inject(ChangeDetectorRef);
  private readonly route     = inject(ActivatedRoute);

  currentUser: Authentication | null = null;

  get initials(): string {
    return (this.currentUser?.username ?? '').slice(0, 2).toUpperCase();
  }

  // URL-driven context selectors
  selectedProjectKey = '';
  selectedPlanId = '';

  memberships$: Observable<ProjectMembership[]> = of([]);

  private _testPlans$ = new BehaviorSubject<TestPlan[]>([]);
  readonly testPlans$: Observable<TestPlan[]> = this._testPlans$.asObservable();

  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  readonly suiteLoading$: Observable<boolean> = this._suiteLoading$.asObservable();

  allSuites: TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  treeSearch = '';

  showSidebar = true;
  sidebarCollapsed = false;

  // ── Sidebar frames ────────────────────────────────────────────────────────
  activeSidebarFrame: SidebarFrame = 'explorer';

  // ── Filter panel state ────────────────────────────────────────────────────
  filterTcId          = '';
  filterTcTitle       = '';
  filterKeyword       = '';
  filterPriority      = '';
  filterExecType      = '';
  filterAssignedTo    = '';
  filterResult        = '';
  filterOnBuild       = 'latest';
  filterSpecificBuild = 'rc1';
  showCustomFields    = false;
  showAdvancedFilters = false;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.showSidebar = true;

    // 1. Track authenticated user
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      });

    // 2. Memberships list (for project dropdown)
    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() =>
        this.projects.getProjectMemberships().pipe(catchError(() => of([])))
      ),
      startWith([])
    );

    // 3. PRIMARY SYNC: URL → component state
    this.router.routerState.root.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const projectKey = params['project'] ?? null;
        const planId     = params['plan']    ?? null;

        if (projectKey !== this.selectedProjectKey) {
          this.selectedProjectKey = projectKey ?? '';
          this.ctx.setProject(projectKey ?? '');

          if (projectKey) {
            this.loadSuites(projectKey);
            this.loadPlansIntoSubject(projectKey);
          } else {
            this.allSuites = [];
            this.filteredSuites = [];
            this._testPlans$.next([]);
          }
        }

        const newPlanId = planId ?? '';
        if (newPlanId !== this.selectedPlanId) {
          this.selectedPlanId = newPlanId;
          if (planId) this.ctx.setPlan(planId);
        }

        if (!projectKey && !planId) {
          const saved = this.ctx.snapshot;
          if (saved.projectKey || saved.testPlanId) {
            this.router.navigate([], {
              queryParams: {
                project: saved.projectKey ?? undefined,
                plan:    saved.testPlanId  ?? undefined,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
            return;
          }
        }

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── URL-driven change handlers ────────────────────────────────────────────

  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: {
        project:  key,
        plan:     null,
        suite:    null,
        testcase: null,
        version:  null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { plan: id, testRunId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  refresh(): void {
    if (this.selectedProjectKey) {
      this.loadSuites(this.selectedProjectKey);
    }
    this.router.navigate(['/explorer']);
  }

  logout(): void {
    this.auth.logout();
  }

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

  // ── Filter panel actions ──────────────────────────────────────────────────

  applyFilters(): void {
    // Wire up to your filter/query-param service here.
    // Current values are available on all filterXxx properties.
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.filterTcId          = '';
    this.filterTcTitle       = '';
    this.filterKeyword       = '';
    this.filterPriority      = '';
    this.filterExecType      = '';
    this.filterAssignedTo    = '';
    this.filterResult        = '';
    this.filterOnBuild       = 'latest';
    this.filterSpecificBuild = 'rc1';
    this.cdr.markForCheck();
  }

  toggleCustomFields(): void {
    this.showCustomFields = !this.showCustomFields;
    this.cdr.markForCheck();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    this.cdr.markForCheck();
  }

  onFilterBuildChange(value: string): void {
    this.filterOnBuild = value;
    if (value !== 'specific') {
      this.filterSpecificBuild = 'rc1';
    }
    this.cdr.markForCheck();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadSuites(projectKey: string): void {
    this._suiteLoading$.next(true);
    this.suitesSvc
      .getTestSuitesByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe(suites => {
        this.allSuites      = suites;
        this.filteredSuites = suites;
        this.treeState.setTreeData(suites);
        this._suiteLoading$.next(false);
        this.cdr.markForCheck();
      });
  }

  private loadPlansIntoSubject(projectKey: string): void {
    this._testPlans$.next([]);
    this.plansSvc
      .getTestPlansByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe(plans => {
        this._testPlans$.next(plans);
        this.cdr.markForCheck();
      });
  }

  private filterSuites(suites: TestSuite[], q: string): TestSuite[] {
    return suites.reduce<TestSuite[]>((acc, s) => {
      const nameMatch    = s.name.toLowerCase().includes(q);
      const childMatches = this.filterSuites(s.children ?? [], q);
      if (nameMatch || childMatches.length) {
        acc.push({ ...s, children: childMatches.length ? childMatches : s.children });
      }
      return acc;
    }, []);
  }
}

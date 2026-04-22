import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, of, combineLatest } from 'rxjs';
import { map, catchError, filter, take, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ContextService } from '../../core/services/context.service';
import { TreeStateService } from '../../core/services/tree-state.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { TestCaseService } from '../../core/services/test-case.service';
import { TestPlanRunService } from '../../core/services/test-plan-run.service';
import { TestPlanRunItemService } from '../../core/services/test-plan-run-item.service';
import { ProjectService } from '../../core/services/project.service';

import { TestPlan, TestPlanRunItem } from '../../core/models/testexecution';
import { TestSuite } from '../../core/models/testsuite';

import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CaseTableComponent } from './case-table/case-table.component';
import { ExecutionTableComponent } from './execution-table/execution-table.component';
import { TestCaseListComponent } from '../test-management/test-cases/test-case-list/test-case-list.component';
import { TestCaseDetailComponent } from '../test-management/test-cases/test-case-detail/test-case-detail.component';
import { TestCaseVersionContentComponent } from '../test-management/test-cases/test-case-version-content/test-case-version-content.component';
import { TestCaseVersionRunsComponent } from '../test-management/test-cases/test-case-version-runs/test-case-version-runs.component';

interface PlanStats {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
}

@Component({
  selector: 'app-test-explorer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    StatusBadgeComponent,
    CaseTableComponent,
    ExecutionTableComponent,
    TestCaseListComponent,
    TestCaseDetailComponent,
    TestCaseVersionContentComponent,
    TestCaseVersionRunsComponent,
  ],
  templateUrl: './test-explorer.component.html',
  styleUrls: ['./test-explorer.component.scss'],
})
export class TestExplorerComponent implements OnInit, OnDestroy {
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly casesSvc = inject(TestCaseService);
  private readonly runSvc = inject(TestPlanRunService);
  private readonly runItemSvc = inject(TestPlanRunItemService);
  private readonly projSvc = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── State derived from query parameters (all strings, except version which we convert to number) ──
  readonly projectKey$ = this.route.queryParams.pipe(
    map(params => params['project'] || null),
    distinctUntilChanged()
  );
  readonly planId$ = this.route.queryParams.pipe(
    map(params => params['plan'] || null),
    distinctUntilChanged()
  );
  readonly suiteId$ = this.route.queryParams.pipe(
    map(params => params['suite'] || null),
    distinctUntilChanged()
  );
  readonly testCaseId$ = this.route.queryParams.pipe(
    map(params => params['testcase'] || null), // keep as string
    distinctUntilChanged()
  );
  readonly versionNumber$ = this.route.queryParams.pipe(
    map(params => params['version'] ? Number(params['version']) : null),
    distinctUntilChanged()
  );
  readonly activeTab$ = this.route.queryParams.pipe(
    map(params => params['tab'] || 'overview'),
    distinctUntilChanged()
  );

  // ── Data streams ──────────────────────────────────────────────────────────
  projectName$: Observable<string> = of('');
  testPlan$: Observable<TestPlan | null> = of(null);
  planStats$: Observable<PlanStats> = of({ total: 0, passed: 0, failed: 0, blocked: 0, notRun: 0 });
  runItems$: Observable<TestPlanRunItem[]> = of([]);
  allCases$: Observable<import('../../core/models/testsuite').TestCase[]> = of([]);

  planName = '';
  private subs = new Subscription();
  private isSyncingFromUrl = false;

  ngOnInit(): void {
    // Keep ContextService in sync with query params
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$]).subscribe(([project, plan]) => {
        if (project) this.ctx.setProject(project);
        if (plan) this.ctx.setPlan(plan);
      })
    );

    // Load project name
    this.subs.add(
      this.projectKey$.subscribe(key => {
        if (key) {
          this.projectName$ = this.projSvc.getProjectByKey(key).pipe(
            map(p => p.displayName),
            catchError(() => of(key))
          );
        } else {
          this.projectName$ = of('');
        }
      })
    );

    // Load plan data when both project and plan are present
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$]).subscribe(([projectKey, planId]) => {
        if (projectKey && planId) {
          this.loadPlanData(projectKey, planId);
        }
      })
    );

    // Sync tree selection with query params (suite/testcase)
    this.subs.add(
      combineLatest([this.suiteId$, this.testCaseId$]).subscribe(([suiteId, testCaseId]) => {
        this.syncTreeFromParams(suiteId, testCaseId);
      })
    );

    // Handle ?view=execution query param (legacy)
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['view'] === 'execution') {
          this.setTab('runs');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  setTab(tab: string): void {
    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private syncTreeFromParams(suiteId: string | null, testCaseId: string | null): void {
    if (!suiteId) {
      this.treeState.clearSelection();
      return;
    }
    this.isSyncingFromUrl = true;
    this.treeState.waitForTree().pipe(
      filter(tree => tree.length > 0),
      take(1)
    ).subscribe(() => {
      const suite = this.treeState.findSuiteById(suiteId);
      if (suite) {
        this.treeState.selectSuite(suite);
        if (!this.treeState.isExpanded(suite.testSuiteId)) {
          this.treeState.toggle(suite.testSuiteId);
        }
        // testCaseId highlighting is handled by the template via isCaseSelected
      }
      this.isSyncingFromUrl = false;
      this.cdr.markForCheck();
    });
  }

  // ── Plan data ─────────────────────────────────────────────────────────────
  private loadPlanData(projectKey: string, planId: string): void {
    this.testPlan$ = this.plansSvc.getTestPlan(projectKey, planId).pipe(catchError(() => of(null)));
    this.subs.add(
      this.testPlan$.subscribe(plan => {
        this.planName = plan?.name ?? '';
        this.cdr.markForCheck();
      })
    );

    this.runItems$ = this.runSvc.getTestRunsByTestPlan(projectKey, planId).pipe(
      switchMap(runs => {
        if (!runs.length) return of([]);
        return this.runItemSvc.getRunItems(projectKey, planId, runs[0].testPlanRunId);
      }),
      catchError(() => of([]))
    );

    this.planStats$ = this.runItems$.pipe(map(items => this.computeStats(items)));
    this.allCases$ = this.casesSvc.getTestCases(projectKey, '').pipe(catchError(() => of([])));
  }

  private computeStats(items: TestPlanRunItem[]): PlanStats {
    const total = items.length;
    const passed = items.filter(i => i.status === 'PASSED').length;
    const failed = items.filter(i => i.status === 'FAILED').length;
    const blocked = items.filter(i => i.status === 'BLOCKED').length;
    const notRun = items.filter(i => i.status === 'NOT_RUN').length;
    return { total, passed, failed, blocked, notRun };
  }

  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  // ── UI actions ────────────────────────────────────────────────────────────
  clearSelection(): void {
    this.router.navigate([], {
      queryParams: { suite: null, testcase: null, version: null, tab: 'overview' },
      queryParamsHandling: 'merge'
    });
  }
}

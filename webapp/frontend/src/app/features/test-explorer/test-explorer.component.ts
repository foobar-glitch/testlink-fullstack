import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of, EMPTY } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import { ContextService } from '../../core/services/context.service';
import { TreeStateService, TreeSelection } from '../../core/services/tree-state.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { TestCaseService } from '../../core/services/test-case.service';
import { TestCaseVersionStepService } from '../../core/services/test-case-version-step.service';
import { TestPlanRunService } from '../../core/services/test-plan-run.service';
import { TestPlanRunItemService } from '../../core/services/test-plan-run-item.service';
import { ProjectService } from '../../core/services/project.service';

import { TestPlan, TestPlanRunItem } from '../../core/models/testexecution';
import { TestSuite, TestCase, TestCaseVersionStep } from '../../core/models/testsuite';

import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CaseTableComponent } from './case-table/case-table.component';
import { ExecutionTableComponent } from './execution-table/execution-table.component';

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
    TitleCasePipe,
    SpinnerComponent,
    StatusBadgeComponent,
    CaseTableComponent,
    ExecutionTableComponent,
  ],
  templateUrl: './test-explorer.component.html',
  styleUrls: ['./test-explorer.component.scss'],
})
export class TestExplorerComponent implements OnInit, OnDestroy {
  private readonly ctx        = inject(ContextService);
  private readonly treeState  = inject(TreeStateService);
  private readonly plansSvc   = inject(TestPlanService);
  private readonly casesSvc   = inject(TestCaseService);
  private readonly stepsSvc   = inject(TestCaseVersionStepService);
  private readonly runSvc     = inject(TestPlanRunService);
  private readonly runItemSvc = inject(TestPlanRunItemService);
  private readonly projSvc    = inject(ProjectService);
  private readonly router     = inject(Router);
  private readonly route      = inject(ActivatedRoute);
  private readonly cdr        = inject(ChangeDetectorRef);

  // ── Context ───────────────────────────────────────────────────────────
  projectKey: string | null = null;
  planId: string | null     = null;
  planName                  = '';
  parentSuiteName           = '';

  // ── Selection ─────────────────────────────────────────────────────────
  selection: TreeSelection = { type: 'none' };

  // ── Data streams ──────────────────────────────────────────────────────
  projectName$: Observable<string>       = of('');
  testPlan$: Observable<TestPlan | null> = of(null);
  planStats$: Observable<PlanStats>      = of({ total: 0, passed: 0, failed: 0, blocked: 0, notRun: 0 });
  runItems$: Observable<TestPlanRunItem[]> = of([]);
  allCases$: Observable<TestCase[]>      = of([]);
  suiteTestCases$: Observable<TestCase[]> = of([]);
  caseSteps$: Observable<TestCaseVersionStep[]> = of([]);

  // ── UI state ──────────────────────────────────────────────────────────
  overviewTab: 'runs' | 'cases' = 'runs';
  caseTab: 'details' | 'steps' | 'history' = 'details';

  private subs = new Subscription();

  ngOnInit(): void {
    // Restore context
    const saved = this.ctx.snapshot;
    this.projectKey = saved.projectKey;
    this.planId     = saved.testPlanId;

    if (this.projectKey) {
      this.projectName$ = this.projSvc.getProjectByKey(this.projectKey).pipe(
        map(p => p.displayName),
        catchError(() => of(this.projectKey!)),
      );
    }

    if (this.projectKey && this.planId) {
      this.loadPlanData(this.projectKey, this.planId);
    }

    // React to tree selection changes
    this.subs.add(
      this.treeState.selection$.subscribe(sel => {
        this.selection = sel;
        this.onSelectionChange(sel);
        this.cdr.markForCheck();
      }),
    );

    // React to context changes (project/plan swapped in topbar)
    this.subs.add(
      this.ctx.ctx$.subscribe(c => {
        const pkChanged  = c.projectKey  !== this.projectKey;
        const pidChanged = c.testPlanId !== this.planId;
        this.projectKey  = c.projectKey;
        this.planId      = c.testPlanId;

        if (this.projectKey) {
          this.projectName$ = this.projSvc.getProjectByKey(this.projectKey).pipe(
            map(p => p.displayName),
            catchError(() => of(this.projectKey!)),
          );
        }

        if (this.projectKey && this.planId && (pkChanged || pidChanged)) {
          this.treeState.clearSelection();
          this.loadPlanData(this.projectKey, this.planId);
        }
        this.cdr.markForCheck();
      }),
    );

    // Handle ?view=execution query param from topbar button
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['view'] === 'execution') {
          this.overviewTab = 'runs';
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Selection handler ─────────────────────────────────────────────────
  private onSelectionChange(sel: TreeSelection): void {
    if (sel.type === 'suite') {
      this.loadSuiteCases(sel.suite);
    } else if (sel.type === 'case') {
      const tc = sel.testCase;
      this.parentSuiteName = tc.testSuite?.name ?? '';
      this.loadCaseSteps(tc);
    }
  }

  // ── Plan data ─────────────────────────────────────────────────────────
  private loadPlanData(projectKey: string, planId: string): void {
    this.testPlan$ = this.plansSvc.getTestPlan(projectKey, planId).pipe(
      catchError(() => of(null)),
    );

    // Use test plan name for breadcrumb/header
    this.subs.add(
      this.testPlan$.subscribe(plan => {
        this.planName = plan?.name ?? '';
        this.cdr.markForCheck();
      }),
    );

    // Stats: derive from run items (fallback mock when backend has no aggregate endpoint)
    this.runItems$ = this.plansSvc.getTestPlansByProjectKey(projectKey).pipe(
      switchMap(plans => {
        // Try loading runs for the selected plan
        return this.runSvc.getTestRunsByTestPlan(projectKey, planId).pipe(
          catchError(() => of([])),
        );
      }),
      // For now flatten first run's items as a proxy
      switchMap(runs => {
        if (!runs.length) return of([]);
        return this.runItemSvc.getRunItems(projectKey, planId, runs[0].testPlanRunId).pipe(
          catchError(() => of([])),
        );
      }),
    );

    this.planStats$ = this.runItems$.pipe(
      map(items => this.computeStats(items)),
    );

    // All cases: aggregate from all suites (lazy — do only when tab is active)
    this.allCases$ = this.casesSvc.getTestCases(projectKey, '').pipe(
      catchError(() => of([])),
    );
  }

  private loadSuiteCases(suite: TestSuite): void {
    const pk = this.projectKey;
    if (!pk) return;
    this.suiteTestCases$ = this.casesSvc
      .getTestCases(pk, suite.testSuiteId)
      .pipe(catchError(() => of([])));
  }

  private loadCaseSteps(tc: TestCase): void {
    const pk = this.projectKey;
    if (!pk) return;
    // Load latest version steps
    this.caseSteps$ = this.stepsSvc
      .getSteps(pk, tc.testSuite?.testSuiteId ?? '', tc.identifierNumber, 1)
      .pipe(catchError(() => of([])));
  }

  // ── Stat helper ───────────────────────────────────────────────────────
  private computeStats(items: TestPlanRunItem[]): PlanStats {
    const total   = items.length;
    const passed  = items.filter(i => i.status === 'PASSED').length;
    const failed  = items.filter(i => i.status === 'FAILED').length;
    const blocked = items.filter(i => i.status === 'BLOCKED').length;
    const notRun  = items.filter(i => i.status === 'NOT_RUN').length;
    return { total, passed, failed, blocked, notRun };
  }

  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  // ── UI actions ────────────────────────────────────────────────────────
  clearSelection(): void {
    this.treeState.clearSelection();
  }

  backToSuite(): void {
    const sel = this.selection;
    if (sel.type === 'case' && sel.testCase.testSuite) {
      this.treeState.selectSuite(sel.testCase.testSuite);
    } else {
      this.treeState.clearSelection();
    }
  }

  selectSuiteFromChip(suite: TestSuite): void {
    this.treeState.selectSuite(suite);
  }

  onCaseSelectedFromTable(tc: TestCase): void {
    this.treeState.selectCase(tc);
  }

  goToRuns(): void {
    if (this.projectKey && this.planId) {
      this.router.navigate([
        '/projects/project-key', this.projectKey, 'testplans', this.planId, 'runs',
      ]);
    }
  }

  goToVersions(): void {
    const sel = this.selection;
    if (sel.type === 'case' && this.projectKey) {
      const tc = sel.testCase;
      this.router.navigate([
        '/projects/project-key', this.projectKey,
        'suites', tc.testSuite?.testSuiteId,
        'testcases', tc.identifierNumber, 'versions',
      ]);
    }
  }
}

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
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, catchError, map, filter, take } from 'rxjs/operators';

import { ContextService } from '../../core/services/context.service';
import { TreeStateService, TreeSelection } from '../../core/services/tree-state.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { TestCaseService } from '../../core/services/test-case.service';
import { TestCaseVersionStepService } from '../../core/services/test-case-version-step.service';
import { TestPlanRunService } from '../../core/services/test-plan-run.service';
import { TestPlanRunItemService } from '../../core/services/test-plan-run-item.service';
import { ProjectService } from '../../core/services/project.service';

import { TestCaseVersionStep, TestPlan, TestPlanRunItem } from '../../core/models/testexecution';
import { TestSuite, TestCase } from '../../core/models/testsuite';

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
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly casesSvc = inject(TestCaseService);
  private readonly stepsSvc = inject(TestCaseVersionStepService);
  private readonly runSvc = inject(TestPlanRunService);
  private readonly runItemSvc = inject(TestPlanRunItemService);
  private readonly projSvc = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Context ───────────────────────────────────────────────────────────
  projectKey: string | null = null;
  planId: string | null = null;
  planName = '';
  parentSuiteName = '';

  // ── Selection ─────────────────────────────────────────────────────────
  selection: TreeSelection = { type: 'none' };

  // ── Data streams ──────────────────────────────────────────────────────
  projectName$: Observable<string> = of('');
  testPlan$: Observable<TestPlan | null> = of(null);
  planStats$: Observable<PlanStats> = of({ total: 0, passed: 0, failed: 0, blocked: 0, notRun: 0 });
  runItems$: Observable<TestPlanRunItem[]> = of([]);
  allCases$: Observable<TestCase[]> = of([]);
  suiteTestCases$: Observable<TestCase[]> = of([]);
  caseSteps$: Observable<TestCaseVersionStep[]> = of([]);

  // ── UI state ──────────────────────────────────────────────────────────
  overviewTab: 'runs' | 'cases' = 'runs';
  caseTab: 'details' | 'steps' | 'history' = 'details';

  private subs = new Subscription();

  private isSyncingFromUrl = false;   // <-- add this

  private expandPathTo(suite: TestSuite): void {
    // Expand all ancestors – the tree state already has expand/collapse,
    // but we can ensure the suite itself is expanded.
    if (!this.treeState.isExpanded(suite.testSuiteId)) {
      this.treeState.toggle(suite.testSuiteId);
    }
    // We might need to expand parents recursively – simplified here.
  }

  private findTestCaseInSuite(suite: TestSuite, identifier: number): TestCase | undefined {
    // This would require fetching test cases for the suite – better to use the already loaded testCases$
    // or add a method in TreeStateService to find a case by identifier.
    // For simplicity, we can rely on the fact that selecting the suite will load cases,
    // and the case row will be highlighted via isCaseSelected in the template.
    return undefined; // we can skip explicit selection; the case row will be highlighted by its own logic.
  }


  ngOnInit(): void {
    // Restore context
    const saved = this.ctx.snapshot;
    this.projectKey = saved.projectKey;
    this.planId = saved.testPlanId;

    this.subs.add(
      this.route.params.subscribe(() => this.syncSelectionFromUrl())
    );
    // Also call once initially
    this.syncSelectionFromUrl();

    // React to tree selection changes and update URL
    this.subs.add(
      this.treeState.selection$.subscribe((sel) => {
        this.selection = sel;
        this.onSelectionChange(sel);
        if (!this.isSyncingFromUrl) {
          this.navigateToSelection(sel);
        }
        this.cdr.markForCheck();
      })
    );

    if (this.projectKey) {
      this.projectName$ = this.projSvc.getProjectByKey(this.projectKey).pipe(
        map((p) => p.displayName),
        catchError(() => of(this.projectKey!)),
      );
    }

    if (this.projectKey && this.planId) {
      this.loadPlanData(this.projectKey, this.planId);
    }

    // React to tree selection changes
    this.subs.add(
      this.treeState.selection$.subscribe((sel) => {
        this.selection = sel;
        this.onSelectionChange(sel);
        this.cdr.markForCheck();
      }),
    );

    // React to context changes (project/plan swapped in topbar)
    this.subs.add(
      this.ctx.ctx$.subscribe((c) => {
        const pkChanged = c.projectKey !== this.projectKey;
        const pidChanged = c.testPlanId !== this.planId;
        this.projectKey = c.projectKey;
        this.planId = c.testPlanId;

        if (this.projectKey) {
          this.projectName$ = this.projSvc.getProjectByKey(this.projectKey).pipe(
            map((p) => p.displayName),
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
      this.route.queryParams.subscribe((params) => {
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
  private navigateToSelection(sel: TreeSelection): void {
    if (!this.projectKey) return;
    if (sel.type === 'suite') {
      this.router.navigate([
        '/projects/project-key', this.projectKey,
        'suites', sel.suite.testSuiteId, 'testcases'
      ]);
    } else if (sel.type === 'case') {
      const tc = sel.testCase;
      this.router.navigate([
        '/projects/project-key', this.projectKey,
        'suites', tc.testSuite.testSuiteId,
        'testcases', tc.identifierNumber,
        'versions'
      ]);
    } else if (sel.type === 'none') {
      // Navigate back to the explorer overview (plan view)
      this.router.navigate(['/explorer']);
    }
  }

  private syncSelectionFromUrl(): void {
    this.isSyncingFromUrl = true;
    const snapshot = this.route.snapshot;
    const suiteId = snapshot.paramMap.get('suiteId');
    const testCaseId = snapshot.paramMap.get('testCaseIdentifier');

    if (!suiteId || !this.projectKey) {
      this.isSyncingFromUrl = false;
      return;
    }

    this.treeState.waitForTree().pipe(
      filter(tree => tree.length > 0),
      take(1)
    ).subscribe(() => {
      const suite = this.treeState.findSuiteById(suiteId);
      if (suite) {
        this.treeState.selectSuite(suite);
        this.expandPathTo(suite);
        if (testCaseId) {
          const identifier = Number(testCaseId);
          const testCase = this.findTestCaseInSuite(suite, identifier);
          if (testCase) {
            this.treeState.selectCase(testCase);
          }
        }
      }
      this.isSyncingFromUrl = false;
    });
  }

  // Remove manual navigation from these methods:
  selectSuiteFromChip(suite: TestSuite): void {
    this.treeState.selectSuite(suite);   // selection will trigger navigation
  }

  onCaseSelectedFromTable(tc: TestCase): void {
    this.treeState.selectCase(tc);       // selection will trigger navigation
  }

  // Also update backToSuite to use navigation instead of direct selection:
  backToSuite(): void {
    const sel = this.selection;
    if (sel.type === 'case' && sel.testCase.testSuite) {
      const suite = sel.testCase.testSuite;
      this.router.navigate([
        '/projects/project-key', this.projectKey,
        'suites', suite.testSuiteId, 'testcases'
      ]);
    } else {
      this.treeState.clearSelection();
    }
  }

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
    this.testPlan$ = this.plansSvc.getTestPlan(projectKey, planId).pipe(catchError(() => of(null)));

    this.subs.add(
      this.testPlan$.subscribe((plan) => {
        this.planName = plan?.name ?? '';
        this.cdr.markForCheck();
      }),
    );

    this.runItems$ = this.plansSvc.getTestPlansByProjectKey(projectKey).pipe(
      switchMap(() => this.runSvc.getTestRunsByTestPlan(projectKey, planId)),
      switchMap((runs) => {
        if (!runs.length) return of([]);
        return this.runItemSvc.getRunItems(projectKey, planId, runs[0].testPlanRunId);
      }),
      catchError(() => of([])),
    );

    this.planStats$ = this.runItems$.pipe(map((items) => this.computeStats(items)));

    // allCases$: aggregate from all suites – keep lazy
    this.allCases$ = this.casesSvc.getTestCases(projectKey, '').pipe(catchError(() => of([])));
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
    this.caseSteps$ = this.stepsSvc
      .getSteps(pk, tc.testSuite?.testSuiteId ?? '', tc.identifierNumber, 1)
      .pipe(catchError(() => of([])));
  }

  // ── Stat helper ───────────────────────────────────────────────────────
  private computeStats(items: TestPlanRunItem[]): PlanStats {
    const total = items.length;
    const passed = items.filter((i) => i.status === 'PASSED').length;
    const failed = items.filter((i) => i.status === 'FAILED').length;
    const blocked = items.filter((i) => i.status === 'BLOCKED').length;
    const notRun = items.filter((i) => i.status === 'NOT_RUN').length;
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



  goToRuns(): void {
    if (this.projectKey && this.planId) {
      this.router.navigate([
        '/projects/project-key',
        this.projectKey,
        'testplans',
        this.planId,
        'runs',
      ]);
    }
  }

  goToVersions(): void {
    const sel = this.selection;
    if (sel.type === 'case' && this.projectKey) {
      const tc = sel.testCase;
      this.router.navigate([
        '/projects/project-key',
        this.projectKey,
        'suites',
        tc.testSuite?.testSuiteId,
        'testcases',
        tc.identifierNumber,
        'versions',
      ]);
    }
  }
}

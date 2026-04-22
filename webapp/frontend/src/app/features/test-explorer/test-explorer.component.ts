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
import { map, catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ContextService } from '../../core/services/context.service';
import { TreeStateService } from '../../core/services/tree-state.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { TestPlanRunService } from '../../core/services/test-plan-run.service';
import { TestPlanRunItemService } from '../../core/services/test-plan-run-item.service';
import { ProjectService } from '../../core/services/project.service';

import { TestPlan, TestPlanRun, TestPlanRunItem } from '../../core/models/testexecution';

import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CaseTableComponent } from './case-table/case-table.component';
import { ExecutionTableComponent } from './execution-table/execution-table.component';
import { TestCaseListComponent } from '../test-management/test-cases/test-case-list/test-case-list.component';
import { TestCaseDetailComponent } from '../test-management/test-cases/test-case-detail/test-case-detail.component';
import { TestCaseVersionContentComponent } from '../test-management/test-cases/test-case-version-content/test-case-version-content.component';
import { TestCaseVersionListComponent } from '../test-management/test-cases/test-case-version-list/test-case-version-list.component';
import { TestCaseVersionRunsComponent } from '../test-management/test-cases/test-case-version-runs/test-case-version-runs.component';
import { TestCaseVersionRunDetailComponent } from '../test-management/test-cases/test-case-version-run-detail/test-case-version-run-detail.component';
import { TestStepResultListComponent } from '../test-management/test-cases/test-step-result-list/test-step-result-list.component';
import { TestStepResultDetailComponent } from '../test-management/test-cases/test-step-result-detail/test-step-result-detail.component';

interface PlanStats {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
}

type ExplorerTab =
  | 'overview'
  | 'details'
  | 'steps'
  | 'versions'
  | 'runs'
  | 'run-detail'
  | 'run-items'
  | 'step-results'
  | 'step-result-detail';

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
    TestCaseVersionListComponent,
    TestCaseVersionRunsComponent,
    TestCaseVersionRunDetailComponent,
    TestStepResultListComponent,
    TestStepResultDetailComponent,
  ],
  templateUrl: './test-explorer.component.html',
  styleUrls: ['./test-explorer.component.scss'],
})
export class TestExplorerComponent implements OnInit, OnDestroy {
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly runSvc = inject(TestPlanRunService);
  private readonly runItemSvc = inject(TestPlanRunItemService);
  private readonly projSvc = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── State derived from query parameters (READ ONLY) ─────────────────────────
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
    map(params => params['testcase'] || null),
    distinctUntilChanged()
  );
  readonly versionNumber$ = this.route.queryParams.pipe(
    map(params => params['version'] ? Number(params['version']) : null),
    distinctUntilChanged()
  );
  readonly activeTab$ = this.route.queryParams.pipe(
    map(params => (params['tab'] || 'overview') as ExplorerTab),
    distinctUntilChanged()
  );
  readonly testRunId$ = this.route.queryParams.pipe(
    map(params => params['testRunId'] || null),
    distinctUntilChanged()
  );
  readonly runItemId$ = this.route.queryParams.pipe(
    map(params => params['runItemId'] || null),
    distinctUntilChanged()
  );
  readonly stepId$ = this.route.queryParams.pipe(
    map(params => params['stepId'] || null),
    distinctUntilChanged()
  );
  readonly actionId$ = this.route.queryParams.pipe(
    map(params => params['actionId'] || null),
    distinctUntilChanged()
  );

  // ── Data streams ──────────────────────────────────────────────────────────
  projectName$: Observable<string> = of('');
  testPlan$: Observable<TestPlan | null> = of(null);
  planStats$: Observable<PlanStats> = of({ total: 0, passed: 0, failed: 0, blocked: 0, notRun: 0 });
  runItems$: Observable<TestPlanRunItem[]> = of([]);
  filteredRunItems$: Observable<TestPlanRunItem[]> = of([]);
  testRuns$: Observable<TestPlanRun[]> = of([]);
  suiteName$ = of<string | null>(null);
  selectedCaseLabel$ = of<string | null>(null);

  planName = '';
  private subs = new Subscription();

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

    // Expand tree path to selected suite when suiteId changes
    this.subs.add(
      this.suiteId$.subscribe(suiteId => {
        if (suiteId) {
          this.treeState.waitForTree().subscribe(() => {
            this.treeState.expandPathTo(suiteId);
            this.cdr.markForCheck();
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── PRIMARY NAVIGATION: Suite-based (folder structure) ─────────────────────

  /** Navigate to a suite - this is the main navigation action from the tree */
  navigateToSuite(suiteId: string): void {
    this.router.navigate([], {
      queryParams: {
        suite: suiteId,
        testcase: null,
        version: null,
        tab: 'cases'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }



  /** Navigate to a test case within a suite */
  navigateToTestCase(suiteId: string, testCaseId: string | number): void {
    this.router.navigate([], {
      queryParams: {
        suite: suiteId,
        testcase: String(testCaseId),
        version: null,
        tab: 'details'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }


  /** Navigate to a specific version's steps */
  navigateToSteps(versionNumber: number): void {
    this.router.navigate([], {
      queryParams: {
        version: versionNumber,
        tab: 'steps'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to versions list */
  navigateToVersions(): void {
    this.router.navigate([], {
      queryParams: {
        version: null,
        tab: 'versions'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to runs for a version */
  navigateToRuns(): void {
    this.router.navigate([], {
      queryParams: {
        tab: 'runs'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to run items (execution view) */
  navigateToRunItems(): void {
    this.router.navigate([], {
      queryParams: {
        tab: 'run-items'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to a specific run detail */
  navigateToRunDetail(runItemId: string): void {
    this.router.navigate([], {
      queryParams: {
        runItemId,
        tab: 'run-detail'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to step results */
  navigateToStepResults(stepId: string): void {
    this.router.navigate([], {
      queryParams: {
        stepId,
        tab: 'step-results'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Navigate to step result detail */
  navigateToStepResultDetail(actionId: string): void {
    this.router.navigate([], {
      queryParams: {
        actionId,
        tab: 'step-result-detail'
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ── SECONDARY CONTEXT: Test Run selection (filters data only) ──────────────

  /** Select a test run - this filters execution data but preserves suite navigation */
  selectTestRun(testRunId: string): void {
    this.router.navigate([], {
      queryParams: { testRunId },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /** Clear suite/testcase filter from run items view */
  clearRunFilter(): void {
    this.router.navigate([], {
      queryParams: {
        suite: null,
        testcase: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ── Plan data loading ─────────────────────────────────────────────────────
  private loadPlanData(projectKey: string, planId: string): void {
    this.testPlan$ = this.plansSvc.getTestPlan(projectKey, planId).pipe(catchError(() => of(null)));
    this.subs.add(
      this.testPlan$.subscribe(plan => {
        this.planName = plan?.name ?? '';
        this.cdr.markForCheck();
      })
    );

    this.testRuns$ = this.runSvc.getTestRunsByTestPlan(projectKey, planId).pipe(catchError(() => of([])));

    // Auto-select first run if none selected
    this.subs.add(
      combineLatest([this.testRuns$, this.testRunId$]).subscribe(([runs, selectedRunId]) => {
        if (runs.length && !selectedRunId) {
          this.router.navigate([], {
            queryParams: { testRunId: runs[0].testPlanRunId },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }
      })
    );

    this.runItems$ = combineLatest([this.testRuns$, this.testRunId$]).pipe(
      switchMap(([runs, selectedRunId]) => {
        if (!runs.length) return of([]);
        const selected = runs.find(run => run.testPlanRunId === selectedRunId) ?? runs[0];
        if (!selected) return of([]);
        return this.runItemSvc.getRunItems(projectKey, selected.testPlanRunId);
      }),
      catchError(() => of([]))
    );

    this.filteredRunItems$ = combineLatest([this.runItems$, this.suiteId$, this.testCaseId$]).pipe(
      map(([items, suiteId, testCaseId]) => {
        if (testCaseId) {
          return items.filter(item => String(item.testCase.identifierNumber) === String(testCaseId));
        }
        if (suiteId) {
          return items.filter(item => item.testCase.testSuite?.testSuiteId === suiteId);
        }
        return items;
      })
    );

    this.suiteName$ = this.suiteId$.pipe(
      map((suiteId) => {
        if (!suiteId) return null;
        return this.treeState.findSuiteById(suiteId)?.name ?? 'Selected suite';
      })
    );

    this.selectedCaseLabel$ = combineLatest([this.testCaseId$, this.filteredRunItems$]).pipe(
      map(([testCaseId, items]) => {
        if (!testCaseId) return null;
        const sample = items.find(item => String(item.testCase.identifierNumber) === String(testCaseId));
        if (!sample) return `Test Case #${testCaseId}`;
        return `${sample.testCase.testSuite?.project?.projectKey ?? ''}-${sample.testCase.identifierNumber}`;
      })
    );

    this.planStats$ = this.runItems$.pipe(map(items => this.computeStats(items)));
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

  /** Build query params preserving project and plan context */
  private buildQueryParams(overrides: Partial<{
    suite: string | null;
    testcase: string | null;
    version: number | null;
    tab: ExplorerTab;
    testRunId: string | null;
    runItemId: string | null;
    stepId: string | null;
    actionId: string | null;
  }>): { [key: string]: any } {
    const snapshot = this.route.snapshot;
    const params = snapshot.queryParams;

    const result: { [key: string]: any } = {
      project: params['project'] || this.ctx.snapshot.projectKey,
      plan: params['plan'] || this.ctx.snapshot.testPlanId,
    };

    // Only add optional params if they have a value (keeps URL clean)
    if (overrides.suite !== undefined) result['suite'] = overrides.suite;
    else if (params['suite']) result['suite'] = params['suite'];

    if (overrides.testcase !== undefined) result['testcase'] = overrides.testcase;
    else if (params['testcase']) result['testcase'] = params['testcase'];

    if (overrides.version !== undefined) result['version'] = overrides.version;
    else if (params['version']) result['version'] = params['version'];

    if (overrides.tab !== undefined) result['tab'] = overrides.tab;
    else if (params['tab']) result['tab'] = params['tab'];

    if (overrides.testRunId !== undefined) result['testRunId'] = overrides.testRunId;
    else if (params['testRunId']) result['testRunId'] = params['testRunId'];

    if (overrides.runItemId !== undefined) result['runItemId'] = overrides.runItemId;
    else if (params['runItemId']) result['runItemId'] = params['runItemId'];

    if (overrides.stepId !== undefined) result['stepId'] = overrides.stepId;
    else if (params['stepId']) result['stepId'] = params['stepId'];

    if (overrides.actionId !== undefined) result['actionId'] = overrides.actionId;
    else if (params['actionId']) result['actionId'] = params['actionId'];

    return result;
  }

// Now all navigation methods are clean and safe:
  navigateToOverview(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({
        suite: null,
        testcase: null,
        version: null,
        tab: 'overview'
      }),
      replaceUrl: true
    });
  }


  navigateToDetails(suiteId: string, testCaseId: string | number): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({
        suite: suiteId,
        testcase: String(testCaseId),
        version: null,
        tab: 'details'
      }),
      replaceUrl: true
    });
  }
}

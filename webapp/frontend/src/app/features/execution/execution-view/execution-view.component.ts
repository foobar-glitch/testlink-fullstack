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

import { ContextService } from '../../../core/services/context.service';
import { TreeStateService } from '../../../core/services/tree-state.service';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { TestPlanRunService } from '../../../core/services/test-plan-run.service';
import { TestPlanRunItemService } from '../../../core/services/test-plan-run-item.service';
import { ProjectService } from '../../../core/services/project.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';

import { TestPlan, TestPlanRun, TestPlanRunItem, TestPlanStats } from '../../../core/models/testexecution';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TestRunStatusBadgeComponent } from '../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestCaseTableComponent } from '../components/test‑case‑table/test‑case‑table.component';
import { ExecutionTableComponent } from '../components/execution-table/execution-table.component';
import { TestCaseDetailComponent } from '../details/test-case-detail/test-case-detail.component';
import { TestCaseVersionContentComponent } from '../details/test-case-version-content/test-case-version-content.component';
import { TestCaseVersionListComponent } from '../details/test-case-version-list/test-case-version-list.component';
import { TestCaseVersionRunsComponent } from '../details/test-case-version-runs/test-case-version-runs.component';
import { TestCaseVersionRunDetailComponent } from '../details/test-case-version-run-detail/test-case-version-run-detail.component';
import { TestStepResultListComponent } from '../details/test-step-result-list/test-step-result-list.component';
import { TestStepResultDetailComponent } from '../details/test-step-result-detail/test-step-result-detail.component';
import { TestCase, TestSuitePlanStats } from '../../../core/models/testsuite';
import { TestCaseService } from '../../../core/services/test-case.service';

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
    TestRunStatusBadgeComponent,
    TestCaseTableComponent,
    ExecutionTableComponent,
    TestCaseDetailComponent,
    TestCaseVersionContentComponent,
    TestCaseVersionListComponent,
    TestCaseVersionRunsComponent,
    TestCaseVersionRunDetailComponent,
    TestStepResultListComponent,
    TestStepResultDetailComponent,
  ],
  templateUrl: './execution-view.component.html',
  styleUrls: ['./execution-view.component.scss'],
})
export class ExecutionViewComponent implements OnInit, OnDestroy {
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly runSvc = inject(TestPlanRunService);
  private readonly casesSvc = inject(TestCaseService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly runItemSvc = inject(TestPlanRunItemService);
  private readonly projSvc = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private projectService = inject(ProjectService);

  testCasesForSuite$: Observable<TestCase[]> = of([]);
  suiteStats$: Observable<TestSuitePlanStats | null> = of(null);
  planStats$: Observable<TestPlanStats | null> = of(null);

  // State derived from query parameters (READ ONLY)
  readonly projectKey$ = this.route.queryParams.pipe(
    map((params) => params['project'] || null),
    distinctUntilChanged(),
  );
  readonly planId$ = this.route.queryParams.pipe(
    map((params) => params['plan'] || null),
    distinctUntilChanged(),
  );
  readonly suiteId$ = this.route.queryParams.pipe(
    map((params) => params['suite'] || null),
    distinctUntilChanged(),
  );
  readonly testCaseId$ = this.route.queryParams.pipe(
    map((params) => params['testcase'] || null),
    distinctUntilChanged(),
  );
  readonly versionNumber$ = this.route.queryParams.pipe(
    map((params) => (params['version'] ? Number(params['version']) : null)),
    distinctUntilChanged(),
  );
  readonly activeTab$ = this.route.queryParams.pipe(
    map((params) => (params['tab'] || 'overview') as ExplorerTab),
    distinctUntilChanged(),
  );
  readonly testRunId$ = this.route.queryParams.pipe(
    map((params) => params['testRunId'] || null),
    distinctUntilChanged(),
  );
  readonly runItemId$ = this.route.queryParams.pipe(
    map((params) => params['runItemId'] || null),
    distinctUntilChanged(),
  );
  readonly stepId$ = this.route.queryParams.pipe(
    map((params) => params['stepId'] || null),
    distinctUntilChanged(),
  );
  readonly actionId$ = this.route.queryParams.pipe(
    map((params) => params['actionId'] || null),
    distinctUntilChanged(),
  );

  // Data streams
  projectName$: Observable<string> = of('');
  testPlan$: Observable<TestPlan | null> = of(null);
  runItems$: Observable<TestPlanRunItem[]> = of([]);
  filteredRunItems$: Observable<TestPlanRunItem[]> = of([]);
  testRuns$: Observable<TestPlanRun[]> = of([]);
  suiteName$ = of<string | null>(null);
  selectedCaseLabel$ = of<string | null>(null);

  planName = '';
  private subs = new Subscription();

  readonly projectStats$ = combineLatest([this.projectKey$, this.planId$]).pipe(
    switchMap(([projectKey, planId]) => {
      if (projectKey && !planId) {
        return this.projectService.getProjectStats(projectKey).pipe(
          catchError(() => of(null))
        );
      }
      return of(null);
    })
  );

  ngOnInit(): void {
    // (A) Load plan data whenever project or plan changes (only once, with distinct)
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$])
        .pipe(distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1]))
        .subscribe(([projectKey, planId]) => {
          if (projectKey && planId) {
            this.loadPlanData(projectKey, planId);
          }
        }),
    );

    // (B) Keep ContextService in sync with the URL (separate concern)
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$]).subscribe(([project, plan]) => {
        if (project) this.ctx.setProject(project);
        if (plan) this.ctx.setPlan(plan);
      }),
    );

    // (C) Load suite data (test cases & suite stats) when suite changes
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$, this.suiteId$]).subscribe(([projectKey, planId, suiteId]) => {
        if (projectKey && suiteId) {
          this.loadTestCasesForSuite(projectKey, suiteId);
          this.suiteStats$ = combineLatest([this.projectKey$, this.planId$, this.suiteId$]).pipe(
            switchMap(([projectKey, planId, suiteId]) => {
              if (projectKey && planId && suiteId) {
                return this.suitesSvc.getTestSuiteStats(projectKey, planId, suiteId).pipe(
                  catchError(() => of(null))
                );
              }
              return of(null);
            })
          );
        } else {
          this.testCasesForSuite$ = of([]);
          this.suiteStats$ = of(null);
        }
      }),
    );

    // (D) Load plan-level stats when plan is selected
    this.subs.add(
      combineLatest([this.projectKey$, this.planId$]).subscribe(([projectKey, planId]) => {
        if (projectKey && planId) {
          this.loadPlanStats(projectKey, planId);
        } else {
          this.planStats$ = of(null);
        }
      }),
    );

    // (E) Load project display name
    this.subs.add(
      this.projectKey$.subscribe((key) => {
        if (key) {
          this.projectName$ = this.projSvc.getProjectByKey(key).pipe(
            map((p) => p.displayName),
            catchError(() => of(key)),
          );
        } else {
          this.projectName$ = of('');
        }
      }),
    );

    // (F) Expand tree path to selected suite when suiteId changes
    this.subs.add(
      this.suiteId$.subscribe((suiteId) => {
        if (suiteId) {
          this.treeState.waitForTree().subscribe(() => {
            this.treeState.expandPathTo(suiteId);
            this.cdr.markForCheck();
          });
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Percentage helper
  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  // Plan data loading (runs, items, etc.)
  private loadPlanData(projectKey: string, planId: string): void {
    this.testPlan$ = this.plansSvc.getTestPlan(projectKey, planId).pipe(catchError(() => of(null)));
    this.subs.add(
      this.testPlan$.subscribe((plan) => {
        this.planName = plan?.name ?? '';
        this.cdr.markForCheck();
      }),
    );

    this.testRuns$ = this.runSvc
      .getTestRunsByTestPlan(projectKey, planId)
      .pipe(catchError(() => of([])));

    this.subs.add(
      combineLatest([this.testRuns$, this.testRunId$]).subscribe(([runs, selectedRunId]) => {
        if (runs.length && !selectedRunId) {
          this.router.navigate([], {
            queryParams: { testRunId: runs[0].testPlanRunId },
            queryParamsHandling: 'merge',
            replaceUrl: true,
            preserveFragment: true,
          });
        }
      }),
    );

    this.runItems$ = combineLatest([this.testRuns$, this.testRunId$]).pipe(
      switchMap(([runs, selectedRunId]) => {
        if (!runs.length) return of([]);
        const selected = runs.find((run) => run.testPlanRunId === selectedRunId) ?? runs[0];
        if (!selected) return of([]);
        return this.runItemSvc.getRunItems(projectKey, selected.testPlanRunId, planId);
      }),
      catchError(() => of([])),
    );

    this.filteredRunItems$ = combineLatest([this.runItems$, this.suiteId$, this.testCaseId$]).pipe(
      map(([items, suiteId, testCaseId]) => {
        if (testCaseId) {
          return items.filter(
            (item) => String(item.testCaseVersion.testCase.identifierNumber) === String(testCaseId),
          );
        }
        if (suiteId) {
          return items.filter((item) => item.testCaseVersion.testCase.testSuite?.testSuiteId === suiteId);
        }
        return items;
      }),
    );

    this.suiteName$ = this.suiteId$.pipe(
      map((suiteId) => {
        if (!suiteId) return null;
        return this.treeState.findSuiteById(suiteId)?.name ?? 'Selected suite';
      }),
    );

    this.selectedCaseLabel$ = combineLatest([this.testCaseId$, this.filteredRunItems$]).pipe(
      map(([testCaseId, items]) => {
        if (!testCaseId) return null;
        const sample = items.find(
          (item) => String(item.testCaseVersion.testCase.identifierNumber) === String(testCaseId),
        );
        if (!sample) return `Test Case #${testCaseId}`;
        return `${sample.testCaseVersion.testCase.testSuite?.project?.projectKey ?? ''}-${sample.testCaseVersion.testCase.identifierNumber}`;
      }),
    );
  }

  private loadTestCasesForSuite(projectKey: string, suiteId: string): void {
    this.testCasesForSuite$ = this.casesSvc
      .getTestCases(projectKey, suiteId)
      .pipe(catchError(() => of([])));
  }

  private loadPlanStats(projectKey: string, planId: string): void {
    this.planStats$ = this.plansSvc
      .getTestPlanStats(projectKey, planId)
      .pipe(catchError(() => of(null)));
  }

  onCaseSelected(testCase: TestCase): void {
    const suiteId = this.route.snapshot.queryParams['suite'];
    if (suiteId) {
      this.navigateToTestCaseDetails(suiteId, testCase.identifierNumber);
    }
  }

  // Navigation methods
  private buildQueryParams(
    overrides: Partial<{
      suite: string | null;
      testcase: string | null;
      version: number | null;
      tab: ExplorerTab;
      testRunId: string | null;
      runItemId: string | null;
      stepId: string | null;
      actionId: string | null;
    }>,
  ): { [key: string]: any } {
    const snapshot = this.route.snapshot;
    const params = snapshot.queryParams;

    const result: { [key: string]: any } = {
      project: params['project'] || this.ctx.snapshot.projectKey,
      plan: params['plan'] || this.ctx.snapshot.testPlanId,
    };

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

  navigateToProjectOverview(): void {
    this.router.navigate([], {
      queryParams: {
        // keep the project from the current URL (no change)
        project: this.route.snapshot.queryParams['project'] || this.ctx.snapshot.projectKey,
        plan: null,          // explicitly remove plan
        suite: null,         // also clear any sub‑selections
        testcase: null,
        version: null,
        runItemId: null,
        stepId: null,
        actionId: null,
        testRunId: null,
        tab: 'overview',     // reset to the default tab
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToPlanOverview(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({
        suite: null,
        testcase: null,
        version: null,
        tab: 'overview',
      }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToSuiteOverview(suiteId: string): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({
        suite: suiteId,
        testcase: null,
        version: null,
        tab: 'overview',
      }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToTestCaseDetails(suiteId: string, testCaseId: string | number): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({
        suite: suiteId,
        testcase: String(testCaseId),
        version: null,
        tab: 'details',
      }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToDetails(suiteId: string, testCaseId: string | number): void {
    this.navigateToTestCaseDetails(suiteId, testCaseId);
  }

  navigateToVersions(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ version: null, tab: 'versions' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToSteps(versionNumber: number): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ version: versionNumber, tab: 'steps' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToVersionSteps(versionNumber: number): void {
    this.navigateToSteps(versionNumber);
  }

  navigateToRuns(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ tab: 'runs' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToVersionRuns(): void {
    this.navigateToRuns();
  }

  navigateToRunItems(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ tab: 'run-items' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToRunDetail(runItemId: string): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ runItemId, tab: 'run-detail' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToStepResults(stepId: string): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ stepId, tab: 'step-results' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  navigateToStepResultDetail(actionId: string): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ actionId, tab: 'step-result-detail' }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  selectTestRun(testRunId: string): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ testRunId }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }

  clearRunFilter(): void {
    this.router.navigate([], {
      queryParams: this.buildQueryParams({ suite: null, testcase: null }),
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }
}

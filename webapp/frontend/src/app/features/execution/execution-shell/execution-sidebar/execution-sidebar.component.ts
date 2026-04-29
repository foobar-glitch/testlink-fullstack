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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TestSuiteTreeNodeComponent } from '../../components/test‑suite‑tree‑node/test‑suite‑tree‑node.component';
import { ContextService } from '../../../../core/services/context.service';
import { TestSuiteService } from '../../../../core/services/test-suite.service';
import { TestPlanService } from '../../../../core/services/test-plan.service';
import { TreeStateService } from '../../../../core/services/tree-state.service';
import { TestSuite } from '../../../../core/models/testsuite';
import { TestPlan } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-sidebar-test-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent, TestSuiteTreeNodeComponent],
  templateUrl: './execution-sidebar.component.html',
  styleUrls: ['./execution-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionSidebarComponent implements OnInit, OnDestroy {
  private readonly ctx = inject(ContextService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly treeState = inject(TreeStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  private destroy$ = new Subject<void>();

  panelExpanded = false;

  projectKey = '';
  planId = '';

  allSuites: TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  treeSearch = '';

  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  readonly suiteLoading$ = this._suiteLoading$.asObservable();

  private _testPlans$ = new BehaviorSubject<TestPlan[]>([]);
  readonly testPlans$: Observable<TestPlan[]> = this._testPlans$.asObservable();

  filterTcId = '';
  filterTcTitle = '';
  filterKeyword = '';
  filterPriority = '';
  filterExecType = '';
  filterAssignedTo = '';
  filterResult = '';
  filterOnBuild = 'latest';
  filterSpecificBuild = 'rc1';
  showCustomFields = false;
  showAdvancedFilters = false;

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.destroy$)).subscribe((fragment) => {
      this.loadFiltersFromFragment(fragment);
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const project = params['project'] || '';
      const plan = params['plan'] || '';

      // When project changes (even without a plan), load the available test plans
      if (project && project !== this.projectKey) {
        this.projectKey = project;
        this.loadPlans(project);
      }

      if (project && plan && (project !== this.projectKey || plan !== this.planId)) {
        this.projectKey = project;
        this.planId = plan;
        this.loadFilteredSuites(project, plan);
      } else if (!project || !plan) {
        this.allSuites = [];
        this.filteredSuites = [];
        this.treeState.setTreeData([]);
        this._suiteLoading$.next(false);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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


  applyFilters(): void {
    this.syncFiltersToUrl();
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.filterTcId = '';
    this.filterTcTitle = '';
    this.filterKeyword = '';
    this.filterPriority = '';
    this.filterExecType = '';
    this.filterAssignedTo = '';
    this.filterResult = '';
    this.filterOnBuild = 'latest';
    this.filterSpecificBuild = 'rc1';
    this.syncFiltersToUrl();
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
    //this.syncFiltersToUrl();
    this.cdr.markForCheck();
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { plan: id, testRunId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }


  private loadPlans(projectKey: string): void {
    this.plansSvc
      .getTestPlansByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe((plans) => {
        this._testPlans$.next(plans);
        this.cdr.markForCheck();
      });
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

  // ── lz-string based filter serialization ─────────────────────────────────
  private getFilterState() {
    return {
      tcId: this.filterTcId,
      tcTitle: this.filterTcTitle,
      keyword: this.filterKeyword,
      priority: this.filterPriority,
      execType: this.filterExecType,
      assignedTo: this.filterAssignedTo,
      result: this.filterResult,
      onBuild: this.filterOnBuild,
      specificBuild: this.filterSpecificBuild,
    };
  }

  syncFiltersToUrl(): void {
    const state = this.getFilterState();
    const cleaned = Object.fromEntries(
      Object.entries(state).filter(([_, v]) => v !== '')
    );

    if (Object.keys(cleaned).length === 0) {
      this.router.navigate([], {
        fragment: undefined,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      return;
    }

    const json = JSON.stringify(cleaned);
    const compressed = compressToEncodedURIComponent(json);
    const fragment = `filters=${compressed}`;

    this.router.navigate([], {
      fragment,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private loadFiltersFromFragment(fragment: string | null): void {
    if (!fragment || !fragment.startsWith('filters=')) {
      return;
    }

    const compressed = fragment.substring('filters='.length);
    if (!compressed) return;

    try {
      const json = decompressFromEncodedURIComponent(compressed);
      if (!json) return;
      const state = JSON.parse(json);

      this.filterTcId = state.tcId || '';
      this.filterTcTitle = state.tcTitle || '';
      this.filterKeyword = state.keyword || '';
      this.filterPriority = state.priority || '';
      this.filterExecType = state.execType || '';
      this.filterAssignedTo = state.assignedTo || '';
      this.filterResult = state.result || '';
      this.filterOnBuild = state.onBuild || 'latest';
      this.filterSpecificBuild = state.specificBuild || 'rc1';
      this.cdr.markForCheck();
    } catch (e) {
      // ignore malformed fragment
    }
  }

  private loadFilteredSuites(projectKey: string, planId: string): void {
    this._suiteLoading$.next(true);
    this.suitesSvc.getFilteredSuites(projectKey, planId)
      .pipe(catchError(() => of([])))
      .subscribe(suites => {
        this.allSuites = suites;
        this.filteredSuites = this.treeSearch.trim()
          ? this.filterSuites(suites, this.treeSearch.toLowerCase())
          : suites;
        this.treeState.setTreeData(suites);
        this._suiteLoading$.next(false);
        this.cdr.markForCheck();
      });
  }
}

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
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SuiteTreeNodeComponent } from '../../execution-view/test-tree-node/suite-tree-node.component';
import { ContextService } from '../../../core/services/context.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { TreeStateService } from '../../../core/services/tree-state.service';
import { TestSuite } from '../../../core/models/testsuite';
import { TestPlan } from '../../../core/models/testexecution';

export type SidebarFrame = 'settings' | 'filters' | 'explorer';

@Component({
  selector: 'app-sidebar-test-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent, SuiteTreeNodeComponent],
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

  // ── URL-derived context ──────────────────────────────────────────────────
  projectKey = '';
  planId = '';

  // ── Suite tree state ─────────────────────────────────────────────────────
  allSuites: TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  treeSearch = '';

  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  readonly suiteLoading$ = this._suiteLoading$.asObservable();

  // ── Test plans (for sidebar Settings frame) ──────────────────────────────
  private _testPlans$ = new BehaviorSubject<TestPlan[]>([]);
  readonly testPlans$: Observable<TestPlan[]> = this._testPlans$.asObservable();

  // ── Sidebar UI state ────────────────────────────────────────────────────
  activeSidebarFrame: SidebarFrame = 'explorer';

  // ── Filter panel state ──────────────────────────────────────────────────
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

  // In ngOnInit, call loadFiltersFromUrl
  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const project = params['project'] || '';
      const plan = params['plan'] || '';

      // Restore filters from URL
      this.loadFiltersFromUrl(params);

      if (project !== this.projectKey) {
        this.projectKey = project;
        if (project) {
          this.loadSuites(project);
          this.loadPlans(project);
        } else {
          this.allSuites = [];
          this.filteredSuites = [];
          this._testPlans$.next([]);
        }
      }

      if (plan !== this.planId) {
        this.planId = plan;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  // Make syncFiltersToUrl public so template can call it
  syncFiltersToUrl(): void {
    const state = this.getFilterState();
    const cleaned = Object.fromEntries(Object.entries(state).filter(([_, v]) => v !== ''));
    if (Object.keys(cleaned).length === 0) {
      this.router.navigate([], {
        queryParams: { f: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      return;
    }
    const json = JSON.stringify(cleaned);
    const encoded = btoa(json); // base64
    this.router.navigate([], {
      queryParams: { f: encoded },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // In loadFiltersFromUrl, add missing field mappings
  private loadFiltersFromUrl(params: any): void {
    const base64 = params['f'];
    if (!base64) return;
    try {
      const json = atob(base64);
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
      // ignore malformed URL
    }
  }

  // ── Simple tab switching ─────────────────────────────────────────────────
  setActiveFrame(frame: SidebarFrame): void {
    this.activeSidebarFrame = frame;
  }

  // ── Tree actions ─────────────────────────────────────────────────────────
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

  // ── Filter panel actions ─────────────────────────────────────────────────
  applyFilters(): void {
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
    this.syncFiltersToUrl(); // <-- added
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
    this.syncFiltersToUrl(); // <-- added
    this.cdr.markForCheck();
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { plan: id, testRunId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────
  private loadSuites(projectKey: string): void {
    this._suiteLoading$.next(true);
    this.suitesSvc
      .getTestSuitesByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe((suites) => {
        this.allSuites = suites;
        this.filteredSuites = suites;
        this.treeState.setTreeData(suites);
        this._suiteLoading$.next(false);
        this.cdr.markForCheck();
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
}

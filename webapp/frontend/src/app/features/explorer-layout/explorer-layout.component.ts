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
import { ContextService } from '../../core/services/context.service';
import { TestSuiteService } from '../../core/services/test-suite.service';
import { TestPlanService } from '../../core/services/test-plan.service';
import { TreeStateService } from '../../core/services/tree-state.service';
import { TestSuite } from '../../core/models/testsuite';
import { TestPlan } from '../../core/models/testexecution';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SuiteTreeNodeComponent } from '../test-explorer/test-tree-node/suite-tree-node.component';

export type SidebarFrame = 'settings' | 'filters' | 'explorer';

@Component({
  selector: 'app-explorer-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent, SuiteTreeNodeComponent],
  templateUrl: './explorer-layout.component.html',
  styleUrls: ['./explorer-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerLayoutComponent implements OnInit, OnDestroy {
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
  sidebarCollapsed = false;
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

  ngOnInit(): void {
    // Keep ContextService in sync with URL (explorer always has project & plan)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const project = params['project'] || '';
      const plan = params['plan'] || '';

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

    const saved = localStorage.getItem('panelHeight');
    if (saved) this.panelHeight = +saved;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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

  // Add this method
  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { plan: id, testRunId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  panelHeight = 320; // default height in px

  private resizing = false;
  private startY = 0;
  private startHeight = 0;

  startResize(event: MouseEvent) {
    this.resizing = true;
    this.startY = event.clientY;
    this.startHeight = this.panelHeight;

    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);

    event.preventDefault();
  }

  onResize = (event: MouseEvent) => {
    if (!this.resizing) return;

    const delta = this.startY - event.clientY; // drag up = bigger
    const newHeight = this.startHeight + delta;

    // clamp height so it doesn't break layout
    this.panelHeight = Math.max(180, Math.min(newHeight, 600));
  };

  stopResize = () => {
    this.resizing = false;
    localStorage.setItem('panelHeight', this.panelHeight.toString());
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  };
}

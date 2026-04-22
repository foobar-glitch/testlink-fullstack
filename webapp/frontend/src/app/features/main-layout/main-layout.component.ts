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
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { switchMap, catchError, filter, startWith, take } from 'rxjs/operators';

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
/** Routes on which the left sidebar should be visible */
const HIDE_SIDEBAR_ROUTES: string[] = []; // none for now

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

  private readonly route = inject(ActivatedRoute);

  // ── Auth ──────────────────────────────────────────────────────────────
  currentUser: Authentication | null = null;

  get initials(): string {
    return (this.currentUser?.username ?? '').slice(0, 2).toUpperCase();
  }

  // ── Context selectors ─────────────────────────────────────────────────
  selectedProjectKey = '';
  selectedPlanId     = '';

  memberships$: Observable<ProjectMembership[]> = of([]);
  testPlans$:   Observable<TestPlan[]>           = of([]);

  // ── Sidebar tree ──────────────────────────────────────────────────────
  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  suiteLoading$: Observable<boolean> = this._suiteLoading$.asObservable();

  allSuites:      TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  treeSearch = '';

  // ── Sidebar visibility ────────────────────────────────────────────────
  showSidebar = true;

  private subs = new Subscription();

  ngOnInit(): void {
    this.showSidebar = true;

    // Subscribe to user
    this.subs.add(
      this.auth.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      })
    );

    // Load projects
    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() => this.projects.getProjectMemberships().pipe(catchError(() => of([])))),
      startWith([])
    );

    // Initialize context from query params
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const projectKey = params['project'];
      const planId = params['plan'];
      if (projectKey) {
        this.selectedProjectKey = projectKey;
        this.ctx.setProject(projectKey);
        this.loadSuites(projectKey);
        this.loadPlans(projectKey);
      }
      if (planId) {
        this.selectedPlanId = planId;
        this.ctx.setPlan(planId);
      }
      // If no params, fall back to session storage
      if (!projectKey && !planId) {
        const saved = this.ctx.snapshot;
        if (saved.projectKey) {
          this.selectedProjectKey = saved.projectKey;
          this.loadSuites(saved.projectKey);
          this.loadPlans(saved.projectKey);
        }
        if (saved.testPlanId) {
          this.selectedPlanId = saved.testPlanId;
        }
      }
    });

    // Optionally sync query params when context changes from elsewhere (if needed)
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Context change handlers ───────────────────────────────────────────
  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.selectedProjectKey = key;
    this.selectedPlanId = '';
    this.ctx.setProject(key);
    this.treeState.clearSelection();
    this.loadSuites(key);
    this.loadPlans(key);

    // Update URL query params
    this.router.navigate([], {
      queryParams: { project: key, plan: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedPlanId = id;
    this.ctx.setPlan(id);
    this.treeState.clearSelection();

    this.router.navigate([], {
      queryParams: { plan: id },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  refresh(): void {
    if (this.selectedProjectKey) {
      this.loadSuites(this.selectedProjectKey);
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
        this.allSuites      = suites;
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
      const nameMatch    = s.name.toLowerCase().includes(q);
      const childMatches = this.filterSuites(s.children ?? [], q);
      if (nameMatch || childMatches.length) {
        acc.push({ ...s, children: childMatches.length ? childMatches : s.children });
      }
      return acc;
    }, []);
  }
}

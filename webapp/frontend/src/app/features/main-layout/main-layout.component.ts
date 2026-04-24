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
  private readonly auth = inject(AuthService);
  private readonly projects = inject(ProjectService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly plansSvc = inject(TestPlanService);
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);

  currentUser: Authentication | null = null;

  get initials(): string {
    return (this.currentUser?.username ?? '').slice(0, 2).toUpperCase();
  }

  // Only Project and Test Plan in header
  selectedProjectKey = '';
  selectedPlanId = '';

  memberships$: Observable<ProjectMembership[]> = of([]);
  testPlans$: Observable<TestPlan[]> = of([]);

  private _suiteLoading$ = new BehaviorSubject<boolean>(false);
  suiteLoading$: Observable<boolean> = this._suiteLoading$.asObservable();

  allSuites: TestSuite[] = [];
  filteredSuites: TestSuite[] = [];
  treeSearch = '';

  showSidebar = true;
  sidebarCollapsed = false;

  private subs = new Subscription();

  ngOnInit(): void {
    this.showSidebar = true;

    this.subs.add(
      this.auth.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      })
    );

    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() => this.projects.getProjectMemberships().pipe(catchError(() => of([])))),
      startWith([])
    );

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
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  

  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.selectedProjectKey = key;
    this.selectedPlanId = '';
    this.ctx.setProject(key);
    this.loadSuites(key);
    this.loadPlans(key);

    // Reset to base explorer URL - let it rebuild state
    this.router.navigate(['/explorer'], {
      queryParams: { project: key },
      replaceUrl: true
    });
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedPlanId = id;
    this.ctx.setPlan(id);

    const currentParams = this.route.snapshot.queryParams;

    // Only preserve navigation context (suite/testcase/version/tab)
    // testRunId is intentionally NOT preserved - let explorer reload it
    this.router.navigate([], {
      queryParams: {
        project: currentParams['project'],
        plan: id,
        // Preserve navigation state
        ...(currentParams['suite'] && { suite: currentParams['suite'] }),
        ...(currentParams['testcase'] && { testcase: currentParams['testcase'] }),
        ...(currentParams['version'] && { version: currentParams['version'] }),
        ...(currentParams['tab'] && { tab: currentParams['tab'] })
        // testRunId intentionally omitted - will be reloaded
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
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

  private loadSuites(projectKey: string): void {
    this._suiteLoading$.next(true);
    this.suitesSvc
      .getTestSuitesByProjectKey(projectKey)
      .pipe(catchError(() => of([])))
      .subscribe(suites => {
        this.allSuites = suites;
        this.filteredSuites = suites;
        this.treeState.setTreeData(suites);
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
      const nameMatch = s.name.toLowerCase().includes(q);
      const childMatches = this.filterSuites(s.children ?? [], q);
      if (nameMatch || childMatches.length) {
        acc.push({ ...s, children: childMatches.length ? childMatches : s.children });
      }
      return acc;
    }, []);
  }
}

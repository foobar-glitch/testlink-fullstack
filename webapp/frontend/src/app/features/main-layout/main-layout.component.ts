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
import { switchMap, catchError, filter, startWith } from 'rxjs/operators';

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

    // User
    this.subs.add(
      this.auth.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      })
    );

    // Reactively sync selectors from the URL and load data
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        const projectKey = params['project'] || null;
        const planId = params['plan'] || null;

        // Project changed
        if (projectKey && this.selectedProjectKey !== projectKey) {
          this.selectedProjectKey = projectKey;
          this.ctx.setProject(projectKey);
          this.loadSuites(projectKey);
          this.loadPlans(projectKey);
        }

        // Plan changed
        if (planId && this.selectedPlanId !== planId) {
          this.selectedPlanId = planId;
          this.ctx.setPlan(planId);
        }

        // If URL is empty but saved context exists, redirect to saved context
        if (!projectKey && !planId) {
          const saved = this.ctx.snapshot;
          if (saved.projectKey || saved.testPlanId) {
            this.router.navigate([], {
              queryParams: {
                project: saved.projectKey || undefined,
                plan: saved.testPlanId || undefined,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        }

        this.cdr.markForCheck();
      })
    );

    // Memberships (unchanged)
    this.memberships$ = this.auth.currentUser$.pipe(
      filter(u => u !== null),
      switchMap(() => this.projects.getProjectMemberships().pipe(catchError(() => of([])))),
      startWith([])
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onProjectChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { project: key, plan: null, suite: null, testcase: null, version: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onPlanChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { plan: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
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

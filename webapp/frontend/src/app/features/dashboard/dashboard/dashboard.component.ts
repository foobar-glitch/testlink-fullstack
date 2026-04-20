import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { Project, ProjectMembership } from '../../../core/models/project';
import { TestPlan } from '../../../core/models/testexecution';
import { TestSuite, TestCase } from '../../../core/models/testsuite';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';
import { DashboardContentComponent } from '../dashboard-content/dashboard-content.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    ErrorBannerComponent,
    DashboardSidebarComponent,
    DashboardContentComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private testPlanService = inject(TestPlanService);
  private testSuiteService = inject(TestSuiteService);

  // Context state
  private selectedProjectKey$ = new BehaviorSubject<string | null>(null);
  private selectedTestPlanId$ = new BehaviorSubject<string | null>(null);

  // Data streams - initialized in ngOnInit
  memberships$!: Observable<ProjectMembership[]>;
  projects$!: Observable<Project[]>;
  testPlans$!: Observable<TestPlan[]>;
  suiteTree$!: Observable<TestSuite[]>;

  // Selected node from sidebar
  selectedTreeNode: TestSuite | TestCase | null = null;

  // UI state
  errorMessage = '';
  loading = false;

  // Getters/setters for two‑way binding in template
  get selectedProjectKey(): string | null {
    return this.selectedProjectKey$.value;
  }
  set selectedProjectKey(value: string | null) {
    this.selectedProjectKey$.next(value);
    this.selectedTestPlanId$.next(null);
    this.selectedTreeNode = null;
  }

  get selectedTestPlanId(): string | null {
    return this.selectedTestPlanId$.value;
  }
  set selectedTestPlanId(value: string | null) {
    this.selectedTestPlanId$.next(value);
    this.selectedTreeNode = null;
  }

  ngOnInit(): void {
    // Load user's project memberships
    this.memberships$ = this.projectService.getProjectMemberships().pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return of([]);
      })
    );

    // Extract distinct projects from memberships
    this.projects$ = this.memberships$.pipe(
      map(memberships => memberships.map(m => m.project))
    );

    // When project changes, load its test plans
    this.testPlans$ = this.selectedProjectKey$.pipe(
      switchMap(projectKey =>
        projectKey
          ? this.testPlanService.getTestPlansByProjectKey(projectKey).pipe(
            catchError(err => {
              this.errorMessage = err.message;
              return of([]);
            })
          )
          : of([])
      )
    );

    // Load suite tree for selected project
    this.suiteTree$ = this.selectedProjectKey$.pipe(
      switchMap(projectKey =>
        projectKey
          ? this.testSuiteService.getTestSuitesByProjectKey(projectKey).pipe(
            catchError(err => {
              this.errorMessage = err.message;
              return of([]);
            })
          )
          : of([])
      )
    );
  }

  onTreeNodeSelected(node: TestSuite | TestCase): void {
    this.selectedTreeNode = node;
  }

  refreshData(): void {
    this.selectedProjectKey$.next(this.selectedProjectKey);
    this.selectedTestPlanId$.next(this.selectedTestPlanId);
  }
}

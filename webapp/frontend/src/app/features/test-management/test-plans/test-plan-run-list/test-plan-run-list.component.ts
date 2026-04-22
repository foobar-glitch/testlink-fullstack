import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestPlanRunService } from '../../../../core/services/test-plan-run.service';
import { TestPlanService } from '../../../../core/services/test-plan.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestPlanRun } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-run-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-plan-run-list.component.html',
  styleUrls: ['./test-plan-run-list.component.scss'],
})
export class TestPlanRunListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly testPlanRunService = inject(TestPlanRunService);
  private readonly testPlanService = inject(TestPlanService);

  runs$!: Observable<TestPlanRun[]>;
  testPlanName$!: Observable<string>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;
  planId!: string;

  ngOnInit(): void {
    this.runs$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const plan = params['plan'];
        if (!project || !plan) return of([]);
        this.projectKey = project;
        this.planId = plan;
        return this.testPlanRunService.getTestRunsByTestPlan(project, plan).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test runs';
            return of([]);
          })
        );
      })
    );

    this.testPlanName$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const plan = params['plan'];
        if (!project || !plan) return of('Test Plan');
        return this.testPlanService.getTestPlan(project, plan).pipe(
          map(p => p.name),
          catchError(() => of('Test Plan'))
        );
      })
    );
  }

  selectRun(run: TestPlanRun): void {
    const queryParams = {
      project: this.projectKey,
      plan: this.planId,
      testRunId: run.testPlanRunId,
      tab: 'run-items'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  backToPlans(): void {
    const queryParams = {
      project: this.projectKey,
      tab: 'plans'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

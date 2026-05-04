// src/app/features/test-plan-detail/test-plan-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { TestPlanRunService } from '../../../core/services/test-plan-run.service';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { TestPlanRun } from '../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-plan-detail.component.html',
  styleUrls: ['./test-plan-detail.component.scss'],
})
export class TestPlanDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly runService = inject(TestPlanRunService);
  private readonly planService = inject(TestPlanService);

  projectKey!: string;
  testPlanId!: string;

  runs$!: Observable<TestPlanRun[]>;
  testPlanName$!: Observable<string>;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.projectKey = params['project'] || '';
        this.testPlanId = params['plan'] || '';
        if (!this.projectKey || !this.testPlanId) {
          this.errorMessage = 'No project or plan selected.';
          return of({ runs: [], planName: 'Test Plan' });
        }

        this.runs$ = this.runService.getTestRunsByTestPlan(this.projectKey, this.testPlanId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test runs';
            return of([]);
          })
        );

        this.testPlanName$ = this.planService.getTestPlan(this.projectKey, this.testPlanId).pipe(
          map(plan => plan.name),
          catchError(() => of('Test Plan'))
        );

        return of({ runs: [], planName: '' }); // just trigger the observables
      })
    ).subscribe();
  }

  selectRun(run: TestPlanRun): void {
    this.router.navigate(['/test-plans/run-items'], {
      queryParams: {
        project: this.projectKey,
        plan: this.testPlanId,
        run: run.testPlanRunId
      }
    });
  }
}

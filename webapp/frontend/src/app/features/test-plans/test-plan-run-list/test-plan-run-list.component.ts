import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestPlanRunService } from '../../../core/services/test-plan-run.service';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { TestPlanRun } from '../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-run-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-plan-run-list.component.html',
  styleUrls: ['./test-plan-run-list.component.scss'],
})
export class TestPlanRunListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly testPlanRunService = inject(TestPlanRunService);
  private readonly testPlanService = inject(TestPlanService);

  readonly projectKey: string;
  readonly testPlanId: number;

  runs$: Observable<TestPlanRun[]>;
  testPlanName$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.testPlanId = Number(this.route.snapshot.paramMap.get('testPlanId'));

    this.runs$ = this.testPlanRunService
      .getTestRunsByTestPlan(this.projectKey, this.testPlanId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load test runs';
          return of([]);
        })
      );

    // Fetch test plan name for header
    this.testPlanName$ = this.testPlanService
      .getTestPlan(this.projectKey, this.testPlanId)
      .pipe(
        map(plan => plan.name),
        catchError(() => of('Test Plan'))
      );
  }
}

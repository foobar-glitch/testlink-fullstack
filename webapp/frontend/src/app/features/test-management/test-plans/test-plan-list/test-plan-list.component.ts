import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestPlanService } from '../../../../core/services/test-plan.service';
import { ProjectService } from '../../../../core/services/project.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestPlan } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-plan-list.component.html',
  styleUrls: ['./test-plan-list.component.scss'],
})
export class TestPlanListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testPlanService = inject(TestPlanService);
  private readonly projectService = inject(ProjectService);

  readonly projectKey: string;
  testPlans$: Observable<TestPlan[]>;
  projectName$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;

    this.testPlans$ = this.testPlanService.getTestPlansByProjectKey(this.projectKey).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load test plans';
        return of([]);
      })
    );

    // Optionally fetch project name for the header
    this.projectName$ = this.projectService.getProjectByKey(this.projectKey).pipe(
      map(project => project.displayName),
      catchError(() => of('Project'))
    );
  }

  selectTestPlan(plan: TestPlan): void {
    this.router.navigate([
      '/projects/project-key',
      this.projectKey,
      'testplans',
      plan.testPlanId,
      'runs'
    ]);
  }
}

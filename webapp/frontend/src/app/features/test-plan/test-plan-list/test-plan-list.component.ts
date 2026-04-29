// src/app/features/test-plan-list/test-plan-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { ProjectService } from '../../../core/services/project.service';
import { TestPlan } from '../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-plan-list.component.html',
  styleUrls: ['./test-plan-list.component.scss'],
})
export class TestPlanListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testPlanService = inject(TestPlanService);
  private readonly projectService = inject(ProjectService);

  projectKey!: string;
  testPlans$!: Observable<TestPlan[]>;
  projectName$!: Observable<string>;
  errorMessage = '';

  ngOnInit(): void {
    // Read the project from query params (standard pattern)
    this.route.queryParams
      .pipe(
        switchMap(params => {
          this.projectKey = params['project'] || '';
          if (!this.projectKey) {
            this.errorMessage = 'No project selected.';
            return of([]);
          }

          // Project display name for the header
          this.projectName$ = this.projectService
            .getProjectByKey(this.projectKey)
            .pipe(
              map(p => p.displayName),
              catchError(() => of('Project'))
            );

          // Test plans list
          return this.testPlanService.getTestPlansByProjectKey(this.projectKey).pipe(
            catchError(err => {
              this.errorMessage = err.message || 'Failed to load test plans';
              return of([]);
            })
          );
        })
      )
      .subscribe(plans => {
        this.testPlans$ = of(plans);
      });
  }

  selectTestPlan(plan: TestPlan): void {
    // Navigate to the plan detail page (which lists runs)
    this.router.navigate(['/test-plans/detail'], {
      queryParams: {
        project: this.projectKey,
        plan: plan.testPlanId,
      },
    });
  }
}

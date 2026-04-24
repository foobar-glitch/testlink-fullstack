import { Component, inject, OnInit } from '@angular/core';
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
export class TestPlanListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testPlanService = inject(TestPlanService);
  private readonly projectService = inject(ProjectService);

  testPlans$!: Observable<TestPlan[]>;
  projectName$!: Observable<string>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;

  ngOnInit(): void {
    this.testPlans$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        if (!project) return of([]);
        this.projectKey = project;
        return this.testPlanService.getTestPlansByProjectKey(project).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test plans';
            return of([]);
          })
        );
      })
    );

    this.projectName$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        if (!project) return of('Project');
        return this.projectService.getProjectByKey(project).pipe(
          map(p => p.displayName),
          catchError(() => of('Project'))
        );
      })
    );
  }

  selectTestPlan(plan: TestPlan): void {
    const queryParams = {
      project: this.projectKey,
      plan: plan.testPlanId,
      tab: 'runs'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  backToProjects(): void {
    this.router.navigate(['/projects']);
  }
}

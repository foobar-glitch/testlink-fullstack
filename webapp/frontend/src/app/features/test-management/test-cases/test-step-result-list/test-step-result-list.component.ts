import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestStepResultService } from '../../../../core/services/test-step-result.service';
import { TestCaseVersionStepService } from '../../../../core/services/test-case-version-step.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestStepResult } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-step-result-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent, TestRunStatusBadgeComponent],
  templateUrl: './test-step-result-list.component.html',
  styleUrls: ['./test-step-result-list.component.scss'],
})
export class TestStepResultListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly resultService = inject(TestStepResultService);
  private readonly stepService = inject(TestCaseVersionStepService);

  results$!: Observable<TestStepResult[]>;
  errorMessage = '';

  projectKey!: string;
  stepId!: string;

  ngOnInit(): void {
    this.results$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const stepId = params['stepId'];
        if (!project || !stepId) return of([]);
        this.projectKey = project;
        this.stepId = stepId;
        return this.resultService.getResultsByStep(project, stepId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load execution results';
            return of([]);
          })
        );
      })
    );
  }

  viewResult(result: TestStepResult): void {
    this.router.navigate(['/explorer'], {
      queryParams: {
        project: this.projectKey,
        stepId: this.stepId,
        actionId: result.testStepResultId,
        tab: 'step-result-detail'
      },
      queryParamsHandling: 'merge'
    });
  }
}

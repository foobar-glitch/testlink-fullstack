import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestStepResultService } from '../../../../core/services/test-step-result.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestStepResult } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-step-result-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent, TestRunStatusBadgeComponent],
  templateUrl: './test-step-result-detail.component.html',
  styleUrls: ['./test-step-result-detail.component.scss'],
})
export class TestStepResultDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly resultService = inject(TestStepResultService);

  result$!: Observable<TestStepResult>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;
  stepId!: string;

  ngOnInit(): void {
    this.result$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const actionId = params['actionId'];
        const stepId = params['stepId'];
        if (!project || !actionId) return of(null as any);
        this.projectKey = project;
        this.stepId = stepId || '';
        return this.resultService.getResultById(project, actionId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load step result';
            return of(null as any);
          })
        );
      })
    );
  }

  backToStepResults(): void {
    const queryParams = {
      project: this.projectKey,
      stepId: this.stepId,
      tab: 'step-results'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
export class TestStepResultListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly resultService = inject(TestStepResultService);
  private readonly stepService = inject(TestCaseVersionStepService);

  readonly projectKey: string;
  readonly suiteId: string;
  readonly testCaseIdentifier: number;
  readonly versionNumber: number;
  readonly stepId: string;

  results$: Observable<TestStepResult[]>;
  stepAction$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.suiteId = this.route.snapshot.paramMap.get('suiteId')!;
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.versionNumber = Number(this.route.snapshot.paramMap.get('versionNumber'));
    this.stepId = this.route.snapshot.paramMap.get('stepId')!;

    this.results$ = this.resultService.getResultsByStep(
      this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber, this.stepId
    ).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load execution results';
        return of([]);
      })
    );

    this.stepAction$ = this.stepService.getStepById(
      this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber, this.stepId
    ).pipe(
      map(step => step.stepAction),
      catchError(() => of('Step'))
    );
  }

  viewResult(result: TestStepResult): void {
    this.router.navigate([
      '/projects/project-key',
      this.projectKey,
      'suites',
      this.suiteId,
      'testcases',
      this.testCaseIdentifier,
      'versions',
      this.versionNumber,
      'steps',
      this.stepId,
      'action',
      result.testStepResultId
    ]);
  }
}

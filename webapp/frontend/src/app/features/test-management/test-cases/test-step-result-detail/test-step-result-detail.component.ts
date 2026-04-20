import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
export class TestStepResultDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly resultService = inject(TestStepResultService);

  readonly projectKey: string;
  readonly suiteId: string;
  readonly testCaseIdentifier: number;
  readonly versionNumber: number;
  readonly stepId: string;
  readonly actionId: string;

  result$: Observable<TestStepResult>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.suiteId = this.route.snapshot.paramMap.get('suiteId')!;
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.versionNumber = Number(this.route.snapshot.paramMap.get('versionNumber'));
    this.stepId = this.route.snapshot.paramMap.get('stepId')!;
    this.actionId = this.route.snapshot.paramMap.get('actionId')!;

    this.result$ = this.resultService.getResultById(
      this.projectKey,
      this.suiteId,
      this.testCaseIdentifier,
      this.versionNumber,
      this.stepId,
      this.actionId
    ).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load step result';
        return of(null as any);
      })
    );
  }
}

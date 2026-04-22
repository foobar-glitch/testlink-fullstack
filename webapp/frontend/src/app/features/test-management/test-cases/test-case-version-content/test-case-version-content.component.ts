import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { TestCaseVersionContentService } from '../../../../core/services/test-case-version-content.service';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';

import { TestCaseVersionContent } from '../../../../core/models/testsuite';
import { TestCaseVersionStats } from '../../../../core/models/testsuite';
import { TestCaseVersionStep } from '../../../../core/models/testexecution';
import { TestCaseVersionStepService } from '../../../../core/services/test-case-version-step.service';

@Component({
  selector: 'app-test-case-version-content',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    TestRunStatusBadgeComponent,
  ],
  templateUrl: './test-case-version-content.component.html',
  styleUrls: ['./test-case-version-content.component.scss'],
})
export class TestCaseVersionContentComponent {
  private readonly route           = inject(ActivatedRoute);
  private readonly contentService  = inject(TestCaseVersionContentService);
  private readonly versionService  = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);
  private readonly stepService     = inject(TestCaseVersionStepService);
  private readonly router          = inject(Router);

  readonly projectKey:          string;
  readonly suiteId:             string;
  readonly testCaseIdentifier:  number;
  readonly versionNumber:       number;

  content$:       Observable<TestCaseVersionContent>;
  testCaseTitle$: Observable<string>;
  steps$:         Observable<TestCaseVersionStep[]>;
  /** Stats loaded from the new /stats endpoint */
  stats$:         Observable<TestCaseVersionStats>;
  errorMessage = '';

  constructor() {
    this.projectKey         = this.route.snapshot.paramMap.get('projectKey')!;
    this.suiteId            = this.route.snapshot.paramMap.get('suiteId')!;
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.versionNumber      = Number(this.route.snapshot.paramMap.get('versionNumber'));

    this.content$ = this.contentService
      .getContent(this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber)
      .pipe(catchError(err => { this.errorMessage = err.message || 'Failed to load content'; return of(null as any); }));

    this.testCaseTitle$ = this.testCaseService
      .getTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(map(tc => tc?.title || 'Test Case'), catchError(() => of('Test Case')));

    this.steps$ = this.stepService
      .getSteps(this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber)
      .pipe(catchError(() => of([])));

    // New stats endpoint
    this.stats$ = this.versionService
      .getVersionStats(this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber)
      .pipe(catchError(() => of<TestCaseVersionStats>({
        totalExecutions: 0,
        lastExecutionStatus: null,
        lastExecutedAt: null,
        passedCount: 0,
        failedCount: 0,
        blockedCount: 0,
        avgExecutionTimeMs: null,
      })));
  }

  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  notRunCount(stats: TestCaseVersionStats): number {
    return stats.totalExecutions - stats.passedCount - stats.failedCount - stats.blockedCount;
  }

  barTitle(stats: TestCaseVersionStats): string {
    return `Passed: ${stats.passedCount} · Failed: ${stats.failedCount} · Blocked: ${stats.blockedCount} · Not Run: ${this.notRunCount(stats)}`;
  }

  viewStep(step: TestCaseVersionStep): void {
    this.router.navigate([
      '/projects/project-key', this.projectKey,
      'suite', this.suiteId,
      'testcase-identifier', this.testCaseIdentifier,
      'versions', this.versionNumber,
      'content', 'steps', step.stepId, 'action',
    ]);
  }
}

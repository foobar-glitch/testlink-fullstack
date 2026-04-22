import { Component, inject, Input, OnInit } from '@angular/core';
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
export class TestCaseVersionContentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(TestCaseVersionContentService);
  private readonly versionService = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);
  private readonly stepService = inject(TestCaseVersionStepService);
  private readonly router = inject(Router);

  // Inputs (used when embedded in TestExplorer)
  @Input() projectKey?: string;
  @Input() suiteId?: string;
  @Input() testCaseIdentifier?: number;
  @Input() versionNumber?: number;

  content$!: Observable<TestCaseVersionContent>;
  testCaseTitle$!: Observable<string>;
  steps$!: Observable<TestCaseVersionStep[]>;
  stats$!: Observable<TestCaseVersionStats>;
  errorMessage = '';

  ngOnInit(): void {
    // Prefer inputs, fallback to route parameters
    const projectKey = this.projectKey ?? this.route.snapshot.paramMap.get('projectKey')!;
    const suiteId = this.suiteId ?? this.route.snapshot.paramMap.get('suiteId')!;
    const testCaseIdentifier = this.testCaseIdentifier ?? Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    const versionNumber = this.versionNumber ?? Number(this.route.snapshot.paramMap.get('versionNumber'));

    this.content$ = this.contentService
      .getContent(projectKey, suiteId, testCaseIdentifier, versionNumber)
      .pipe(catchError(err => { this.errorMessage = err.message || 'Failed to load content'; return of(null as any); }));

    this.testCaseTitle$ = this.testCaseService
      .getTestCase(projectKey, testCaseIdentifier, suiteId)
      .pipe(map(tc => tc?.title || 'Test Case'), catchError(() => of('Test Case')));

    this.steps$ = this.stepService
      .getSteps(projectKey, suiteId, testCaseIdentifier, versionNumber)
      .pipe(catchError(() => of([])));

    this.stats$ = this.versionService
      .getVersionStats(projectKey, suiteId, testCaseIdentifier, versionNumber)
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
      '/projects/project-key', this.projectKey ?? this.route.snapshot.paramMap.get('projectKey'),
      'suite', this.suiteId ?? this.route.snapshot.paramMap.get('suiteId'),
      'testcase-identifier', this.testCaseIdentifier ?? this.route.snapshot.paramMap.get('testCaseIdentifier'),
      'versions', this.versionNumber ?? this.route.snapshot.paramMap.get('versionNumber'),
      'content', 'steps', step.stepId, 'action',
    ]);
  }
}

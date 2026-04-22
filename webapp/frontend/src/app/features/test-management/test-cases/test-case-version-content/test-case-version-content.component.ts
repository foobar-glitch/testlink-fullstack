import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { TestCaseVersionContentService } from '../../../../core/services/test-case-version-content.service';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { TestCaseVersionStepService } from '../../../../core/services/test-case-version-step.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';

import { TestCaseVersionContent } from '../../../../core/models/testsuite';
import { TestCaseVersionStats } from '../../../../core/models/testsuite';
import { TestCaseVersionStep } from '../../../../core/models/testexecution';

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
  private readonly router = inject(Router);
  private readonly contentService = inject(TestCaseVersionContentService);
  private readonly versionService = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);
  private readonly stepService = inject(TestCaseVersionStepService);

  // Context values extracted from query params
  private projectKey!: string;
  private testCaseIdentifier!: number;
  private versionNumber!: number;

  content$!: Observable<TestCaseVersionContent>;
  testCaseTitle$!: Observable<string>;
  steps$!: Observable<TestCaseVersionStep[]>;
  stats$!: Observable<TestCaseVersionStats>;
  errorMessage = '';

  ngOnInit(): void {
    // Use query params exclusively
    this.content$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const version = params['version'];
        if (!project || !testcase || !version) return of(null as any);
        this.projectKey = project;
        this.testCaseIdentifier = +testcase;
        this.versionNumber = +version;
        return this.contentService.getContent(project, +testcase, +version).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load content';
            return of(null as any);
          })
        );
      })
    );

    this.testCaseTitle$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        if (!project || !testcase) return of('Test Case');
        return this.testCaseService.getTestCase(project, +testcase).pipe(
          map(tc => tc?.title || 'Test Case'),
          catchError(() => of('Test Case'))
        );
      })
    );

    this.steps$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const version = params['version'];
        if (!project || !testcase || !version) return of([]);
        return this.stepService.getSteps(project, +testcase, +version).pipe(
          catchError(() => of([]))
        );
      })
    );

    this.stats$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const version = params['version'];
        if (!project || !testcase || !version) {
          return of<TestCaseVersionStats>({
            totalExecutions: 0,
            lastExecutionStatus: null,
            lastExecutedAt: null,
            passedCount: 0,
            failedCount: 0,
            blockedCount: 0,
            avgExecutionTimeMs: null,
          });
        }
        return this.versionService.getVersionStats(project, +testcase, +version).pipe(
          catchError(() => of<TestCaseVersionStats>({
            totalExecutions: 0,
            lastExecutionStatus: null,
            lastExecutedAt: null,
            passedCount: 0,
            failedCount: 0,
            blockedCount: 0,
            avgExecutionTimeMs: null,
          }))
        );
      })
    );
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
    const queryParams = {
      project: this.projectKey,
      tab: 'step-results',
      stepId: step.stepId
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  backToVersions(): void {
    const queryParams = {
      project: this.projectKey,
      testcase: this.testCaseIdentifier,
      tab: 'versions'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  viewAllRuns(): void {
    const queryParams = {
      project: this.projectKey,
      testcase: this.testCaseIdentifier,
      version: this.versionNumber,
      tab: 'runs'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

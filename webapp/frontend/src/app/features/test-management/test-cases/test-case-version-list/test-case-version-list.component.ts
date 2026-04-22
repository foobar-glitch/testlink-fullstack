import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';

import { TestCaseVersion, TestCaseVersionStats } from '../../../../core/models/testsuite';

@Component({
  selector: 'app-test-case-version-list',
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
  templateUrl: './test-case-version-list.component.html',
  styleUrls: ['./test-case-version-list.component.scss'],
})
export class TestCaseVersionListComponent {
  private readonly route          = inject(ActivatedRoute);
  private readonly versionService = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);
  private readonly router         = inject(Router);

  readonly projectKey:          string;
  readonly testCaseIdentifier:  number;
  readonly suiteId:             string;

  versions$:       Observable<TestCaseVersion[]>;
  testCaseTitle$:  Observable<string>;
  errorMessage = '';

  // Cache stats observables keyed by versionNumber to avoid re-fetching on CD
  private statsCache = new Map<number, Observable<TestCaseVersionStats>>();

  constructor() {
    this.projectKey         = this.route.snapshot.paramMap.get('projectKey')!;
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.suiteId            = this.route.snapshot.paramMap.get('suiteId')!;

    this.versions$ = this.versionService
      .getVersionsByTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load versions';
          return of([]);
        }),
      );

    this.testCaseTitle$ = this.testCaseService
      .getTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        map(tc => tc?.title || 'Test Case'),
        catchError(() => of('Test Case')),
      );
  }

  /** Lazily fetch and cache stats for each version card. */
  getStats(version: TestCaseVersion): Observable<TestCaseVersionStats> {
    if (!this.statsCache.has(version.versionNumber)) {
      const stats$ = this.versionService
        .getVersionStats(this.projectKey, this.suiteId, this.testCaseIdentifier, version.versionNumber)
        .pipe(catchError(() => of<TestCaseVersionStats>({
          totalExecutions: 0,
          lastExecutionStatus: null,
          lastExecutedAt: null,
          passedCount: 0,
          failedCount: 0,
          blockedCount: 0,
          avgExecutionTimeMs: null,
        })));
      this.statsCache.set(version.versionNumber, stats$);
    }
    return this.statsCache.get(version.versionNumber)!;
  }

  /** Find the highest version number to mark it as "Latest". */
  latestVersionNumber(versions: TestCaseVersion[]): number {
    return Math.max(...versions.map(v => v.versionNumber));
  }

  /** Percentage helper for progress bars. */
  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  barTitle(stats: TestCaseVersionStats): string {
    return [
      `Passed: ${stats.passedCount}`,
      `Failed: ${stats.failedCount}`,
      `Blocked: ${stats.blockedCount}`,
      `Not Run: ${stats.totalExecutions - stats.passedCount - stats.failedCount - stats.blockedCount}`,
    ].join(' · ');
  }

  viewVersion(version: TestCaseVersion): void {
    this.router.navigate([
      '/projects/project-key', this.projectKey,
      'suite', this.suiteId,
      'testcase-identifier', this.testCaseIdentifier,
      'versions', version.versionNumber,
      'content',
    ]);
  }
}

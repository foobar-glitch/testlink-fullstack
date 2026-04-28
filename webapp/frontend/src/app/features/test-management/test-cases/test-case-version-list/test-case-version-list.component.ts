import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

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
export class TestCaseVersionListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly versionService = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);

  projectKey!: string;
  testCaseIdentifier!: number;
  suiteId!: string;

  versions$!: Observable<TestCaseVersion[]>;
  testCaseTitle$!: Observable<string>;
  errorMessage = '';

  private statsCache = new Map<number, Observable<TestCaseVersionStats>>();

  private readonly EMPTY_STATS: TestCaseVersionStats = {
    totalExecutions: 0,
    lastExecutionStatus: null,
    lastExecutedAt: null,
    passedCount: 0,
    failedCount: 0,
    blockedCount: 0,
    notRunCount: 0,
    avgExecutionTimeMs: null,
  };

  ngOnInit(): void {
    this.versions$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const suite = params['suite'];
        if (!project || !testcase) return of([]);
        this.projectKey = project;
        this.testCaseIdentifier = +testcase;
        this.suiteId = suite || '';
        return this.versionService.getVersionsByTestCase(project, +testcase).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load versions';
            return of([]);
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
  }

  getStats(version: TestCaseVersion): Observable<TestCaseVersionStats> {
    if (!this.statsCache.has(version.versionNumber)) {
      const stats$ = this.versionService
        .getVersionStats(this.projectKey, this.testCaseIdentifier, version.versionNumber)
        .pipe(catchError(() => of(this.EMPTY_STATS)));
      this.statsCache.set(version.versionNumber, stats$);
    }
    return this.statsCache.get(version.versionNumber)!;
  }

  latestVersionNumber(versions: TestCaseVersion[]): number {
    if (!versions.length) return 0;
    return Math.max(...versions.map(v => v.versionNumber));
  }

  pct(n: number, total: number): number {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  barTitle(stats: TestCaseVersionStats): string {
    return [
      `Passed: ${stats.passedCount}`,
      `Failed: ${stats.failedCount}`,
      `Blocked: ${stats.blockedCount}`,
      `Not Run: ${stats.notRunCount}`,
    ].join(' · ');
  }

  viewVersion(version: TestCaseVersion): void {
    this.router.navigate(['/explorer'], {
      queryParams: {
        project: this.projectKey,
        suite: this.suiteId,
        testcase: this.testCaseIdentifier,
        version: version.versionNumber,
        tab: 'steps'
      },
      queryParamsHandling: 'merge',
      preserveFragment: true
    });
  }
}

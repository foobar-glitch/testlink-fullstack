import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { TestSuiteService } from '../../../../core/services/test-suite.service';
import { TestCase } from '../../../../core/models/testsuite';

@Component({
  selector: 'app-test-case-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './test-case-list.component.html',
  styleUrls: ['./test-case-list.component.scss'],
})
export class TestCaseListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testCaseService = inject(TestCaseService);
  private readonly testSuiteService = inject(TestSuiteService);

  testCases$: Observable<TestCase[]> = of([]);
  suiteName$: Observable<string> = of('');
  errorMessage = '';

  ngOnInit(): void {
    this.testCases$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const suite = params['suite'];
        if (!project || !suite) return of([]);
        return this.testCaseService.getTestCases(project, suite).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test cases';
            return of([]);
          })
        );
      })
    );

    this.suiteName$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const suite = params['suite'];
        if (!project || !suite) return of('');
        return this.testSuiteService.getTestSuiteByProjectKeyAndId(project, suite).pipe(
          map(hierarchy => hierarchy.current.name),
          catchError(() => of('Test Suite'))
        );
      })
    );
  }

  selectTestCase(testCase: TestCase): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const project = params['project'] ?? testCase.testSuite?.project?.projectKey ?? '';
      const suite = params['suite'] ?? testCase.testSuite?.testSuiteId ?? '';
      const identifier = testCase.identifierNumber;

      const queryParams = {
        project,
        suite,
        testcase: identifier,
        tab: 'details'
      };
      this.router.navigate(['/explorer'], { queryParams });
    });
  }

  backToOverview(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const queryParams = {
        project: params['project'] || null,
        plan: params['plan'] || null,
        tab: 'overview'
      };
      this.router.navigate(['/explorer'], { queryParams });
    });
  }
}

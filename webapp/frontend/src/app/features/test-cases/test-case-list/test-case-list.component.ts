// test-case-list.component.ts
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TestCaseService } from '../../../core/services/test-case.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TestCase } from '../../../core/models/testsuite';

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
  private readonly testCaseService = inject(TestCaseService);
  private readonly testSuiteService = inject(TestSuiteService);
  private readonly router = inject(Router);

  // Optional inputs – if not provided, fall back to route params
  @Input() projectKey?: string;
  @Input() suiteId?: string;

  testCases$: Observable<TestCase[]> = of([]);
  suiteName$: Observable<string> = of('');
  errorMessage = '';

  ngOnInit(): void {
    const project = this.projectKey ?? this.route.snapshot.paramMap.get('projectKey')!;
    const suite = this.suiteId ?? this.route.snapshot.paramMap.get('suiteId')!;

    this.testCases$ = this.testCaseService.getTestCases(project, suite).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load test cases';
        return of([]);
      })
    );

    this.suiteName$ = this.testSuiteService
      .getTestSuiteByProjectKeyAndId(project, suite)
      .pipe(
        map(hierarchy => hierarchy.current.name),
        catchError(() => of('Test Suite'))
      );
  }

  selectTestCase(testCase: TestCase): void {
    const project = this.projectKey ?? testCase.testSuite.project.projectKey;
    const identifier = testCase.identifierNumber;
    const suite = this.suiteId ?? testCase.testSuite.testSuiteId;
    this.router.navigate([
      '/projects/project-key',
      project,
      'suites',
      suite,
      'testcases',
      identifier,
      'versions'
    ]);
  }
}

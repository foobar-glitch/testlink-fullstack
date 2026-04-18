// src/app/features/test-cases/test-case-list/test-case-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TestCaseService } from '../../../core/services/test-case.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { TestCase } from '../../../core/models';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

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
export class TestCaseListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly testCaseService = inject(TestCaseService);
  private readonly testSuiteService = inject(TestSuiteService);

  readonly projectId: number;
  readonly suiteId: number;

  testCases$: Observable<TestCase[]>;
  suiteName$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.suiteId = Number(this.route.snapshot.paramMap.get('suiteId'));

    // Fetch test cases
    this.testCases$ = this.testCaseService
      .getTestCases(this.projectId, this.suiteId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load test cases';
          return of([]);
        })
      );

    // Optionally fetch suite name for the header
    this.suiteName$ = this.testSuiteService
      .getTestSuite(this.projectId, this.suiteId)
      .pipe(
        map(hierarchy => hierarchy.current.name),
        catchError(() => of('Test Suite'))
      );
  }

  getTestCaseIdentifier(testCase: TestCase): string {
    return `${testCase.testSuite.project.projectKey}-${testCase.identifierNumber}`;
  }
}

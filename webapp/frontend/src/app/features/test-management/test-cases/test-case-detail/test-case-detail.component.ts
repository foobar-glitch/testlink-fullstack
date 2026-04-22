// test-case-detail.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestCase } from '../../../../core/models/testsuite';
import { TestCaseVersion } from '../../../../core/models/testsuite';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-test-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    PriorityBadgeComponent,
    ErrorBannerComponent,
    StatusBadgeComponent
  ],
  templateUrl: './test-case-detail.component.html',
  styleUrls: ['./test-case-detail.component.scss']
})
export class TestCaseDetailComponent implements OnInit {
  @Input() projectKey!: string;
  @Input() suiteId!: string;
  @Input() testCaseIdentifier!: number;

  private testCaseService = inject(TestCaseService);
  private versionService = inject(TestCaseVersionService);

  testCase$: Observable<TestCase | null> = of(null);
  versions$: Observable<TestCaseVersion[]> = of([]);
  errorMessage = '';

  ngOnInit(): void {
    this.testCase$ = this.testCaseService
      .getTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load test case';
          return of(null);
        })
      );

    this.versions$ = this.versionService
      .getVersionsByTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        catchError(err => {
          // Not critical, just show empty list
          return of([]);
        })
      );
  }

  getVersionLink(version: TestCaseVersion): string[] {
    return [
      '/projects/project-key',
      this.projectKey,
      'suites',
      this.suiteId,
      'testcases',
      this.testCaseIdentifier.toString(),
      'versions',
      version.versionNumber.toString(),
      'content'
    ];
  }
}

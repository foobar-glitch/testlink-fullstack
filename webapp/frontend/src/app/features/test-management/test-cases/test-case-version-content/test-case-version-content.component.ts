import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TestCaseVersionContentService } from '../../../../core/services/test-case-version-content.service';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestCaseVersionContent } from '../../../../core/models/testsuite';
import { TestCaseVersionStepService } from '../../../../core/services/test-case-version-step.service';
import { TestCaseVersionStep } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-case-version-content',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-case-version-content.component.html',
  styleUrls: ['./test-case-version-content.component.scss'],
})
export class TestCaseVersionContentComponent {
  private readonly route          = inject(ActivatedRoute);
  private readonly contentService = inject(TestCaseVersionContentService);
  private readonly testCaseService = inject(TestCaseService);
  private readonly stepService    = inject(TestCaseVersionStepService);
  private readonly router         = inject(Router);

  readonly projectKey:           string;
  readonly suiteId:              string;
  readonly testCaseIdentifier:   number;
  readonly versionNumber:        number;

  content$:       Observable<TestCaseVersionContent>;
  testCaseTitle$: Observable<string>;
  steps$:         Observable<TestCaseVersionStep[]>;
  errorMessage = '';

  constructor() {
    this.projectKey          = this.route.snapshot.paramMap.get('projectKey')!;
    this.suiteId             = this.route.snapshot.paramMap.get('suiteId')!;
    this.testCaseIdentifier  = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.versionNumber       = Number(this.route.snapshot.paramMap.get('versionNumber'));

    this.content$ = this.contentService
      .getContent(this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load version content';
          return of(null as any);
        })
      );

    this.testCaseTitle$ = this.testCaseService
      .getTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        map(tc => tc?.title || 'Test Case'),
        catchError(() => of('Test Case'))
      );

    // Import TestCaseVersionStep from testsuite (the canonical full type)
    this.steps$ = this.stepService
      .getSteps(this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load steps';
          return of([]);
        })
      );
  }

  viewStep(step: TestCaseVersionStep): void {
    this.router.navigate([
      '/projects/project-key', this.projectKey,
      'suites', this.suiteId,
      'testcases', this.testCaseIdentifier,
      'versions', this.versionNumber,
      'steps', step.stepId,
      'action'
    ]);
  }
}

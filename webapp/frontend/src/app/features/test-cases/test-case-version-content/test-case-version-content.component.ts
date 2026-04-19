import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestCaseVersionContentService } from '../../../core/services/test-case-version-content.service';
import { TestCaseService } from '../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { TestCaseVersionContent } from '../../../core/models/testsuite';

@Component({
  selector: 'app-test-case-version-content',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-case-version-content.component.html',
  styleUrls: ['./test-case-version-content.component.scss'],
})
export class TestCaseVersionContentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(TestCaseVersionContentService);
  private readonly testCaseService = inject(TestCaseService);

  readonly projectKey: string;
  readonly suiteId: number;
  readonly testCaseIdentifier: number;
  readonly versionNumber: number;

  content$: Observable<TestCaseVersionContent>;
  testCaseTitle$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.suiteId = Number(this.route.snapshot.paramMap.get('suiteId'));
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    this.versionNumber = Number(this.route.snapshot.paramMap.get('versionNumber'));

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
  }
}

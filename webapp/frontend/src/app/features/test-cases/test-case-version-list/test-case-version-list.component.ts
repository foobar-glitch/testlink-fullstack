import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TestCaseVersionService } from '../../../core/services/test-case-version.service';
import { TestCaseService } from '../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TestCaseVersion } from '../../../core/models/testsuite';

@Component({
  selector: 'app-test-case-version-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './test-case-version-list.component.html',
  styleUrls: ['./test-case-version-list.component.scss'],
})
export class TestCaseVersionListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly versionService = inject(TestCaseVersionService);
  private readonly testCaseService = inject(TestCaseService);

  // Extract from route: e.g., /testcase/ECP-1/versions
  readonly projectKey: string;
  readonly testCaseIdentifier: number;
  readonly suiteId: number;


  versions$: Observable<TestCaseVersion[]>;
  testCaseTitle$: Observable<string>;
  errorMessage = '';

  constructor() {

    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
    //only for validation testcase validated by projectKey plus testCaseIdentifier like ECU-1212
    this.suiteId = Number(this.route.snapshot.paramMap.get('suiteId'));


    // Fetch versions using projectKey and testCaseIdentifier
    this.versions$ = this.versionService
      .getVersionsByTestCase(this.projectKey, this.testCaseIdentifier, this.suiteId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load versions';
          return of([]);
        })
      );

    // Fetch the test case details to get the title
    this.testCaseTitle$ = this.testCaseService
      .getTestCase(this.projectKey, this.testCaseIdentifier)
      .pipe(
        map(tc => tc?.title || 'Test Case'),
        catchError(() => of('Test Case'))
      );
  }

  getVersionIdentifier(version: TestCaseVersion): string {
    return `v${version.versionNumber}`;
  }

  viewVersion(version: TestCaseVersion): void {
    // Navigate to version detail page (to be implemented)
    console.log('View version', version.testCaseVersionId);
  }
}

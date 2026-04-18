import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TestCaseVersionService } from '../../../core/services/test-case-version.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TestCaseVersion } from '../../../core/models/testsuite';
import { TestCaseService } from '../../../core/services/test-case.service';

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

  readonly projectId: number;
  readonly suiteId: number;
  readonly testCaseId: number;

  versions$: Observable<TestCaseVersion[]>;
  testCaseTitle$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.suiteId = Number(this.route.snapshot.paramMap.get('suiteId'));
    this.testCaseId = Number(this.route.snapshot.paramMap.get('testCaseId'));

    this.versions$ = this.versionService
      .getVersionsByTestCase(this.projectId, this.testCaseId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load versions';
          return of([]);
        })
      );

    this.testCaseTitle$ = this.testCaseService
      .getTestCase(this.projectId, this.suiteId, this.testCaseId)
      .pipe(
        map(tc => tc?.title || 'Test Case'),
        catchError(() => of('Test Case'))
      );
  }

  viewVersion(versionId: number): void {
    // Navigate to version detail page (to be implemented)
    console.log('View version', versionId);
  }
}

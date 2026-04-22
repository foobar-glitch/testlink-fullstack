import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { TestCase } from '../../../../core/models/testsuite';
import { TestCaseVersion } from '../../../../core/models/testsuite';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testCaseService = inject(TestCaseService);
  private readonly versionService = inject(TestCaseVersionService);

  testCase$!: Observable<TestCase | null>;
  versions$!: Observable<TestCaseVersion[]>;
  errorMessage = '';

  projectKey!: string;
  suiteId!: string;
  testCaseIdentifier!: number;

  ngOnInit(): void {
    this.testCase$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const suite = params['suite'];
        const testcase = params['testcase'];
        if (!project || !suite || !testcase) return of(null);
        this.projectKey = project;
        this.suiteId = suite;
        this.testCaseIdentifier = +testcase;
        return this.testCaseService.getTestCase(project, +testcase).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test case';
            return of(null);
          })
        );
      })
    );

    this.versions$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        if (!project || !testcase) return of([]);
        return this.versionService.getVersionsByTestCase(project, +testcase).pipe(
          catchError(() => of([]))
        );
      })
    );
  }

  navigateToVersion(version: TestCaseVersion): void {
    this.router.navigate(['/explorer'], {
      queryParams: {
        project: this.projectKey,
        suite: this.suiteId,
        testcase: this.testCaseIdentifier,
        version: version.versionNumber,
        tab: 'steps'
      },
      queryParamsHandling: 'merge'
    });
  }

  viewAllVersions(): void {
    this.router.navigate(['/explorer'], {
      queryParams: {
        project: this.projectKey,
        suite: this.suiteId,
        testcase: this.testCaseIdentifier,
        tab: 'versions'
      },
      queryParamsHandling: 'merge'
    });
  }
}

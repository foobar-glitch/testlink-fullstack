import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestCase, TestCasePlanStats } from '../../../../core/models/testsuite';
import {
  TestRunStatusBadgeComponent
} from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-test-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
    TestRunStatusBadgeComponent,
    PriorityBadgeComponent,
  ],
  templateUrl: './test-case-detail.component.html',
  styleUrls: ['./test-case-detail.component.scss'],
})
export class TestCaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly testCaseService = inject(TestCaseService);

  testCase$!: Observable<TestCase | null>;
  caseStats$!: Observable<TestCasePlanStats | null>;
  errorMessage = '';

  projectKey!: string;

  ngOnInit(): void {
    this.testCase$ = this.route.queryParams.pipe(
      switchMap((params) => {
        const project = params['project'];
        const testcase = params['testcase'];
        if (!project || !testcase) return of(null);
        this.projectKey = project;
        return this.testCaseService.getTestCase(project, +testcase).pipe(
          catchError((err) => {
            this.errorMessage = err.message || 'Failed to load test case';
            return of(null);
          }),
        );
      }),
    );

    // Inside ngOnInit:
    this.caseStats$ = this.route.queryParams.pipe(
      switchMap((params) => {
        const project = params['project'];
        const plan = params['plan'];
        const testcase = params['testcase'];
        if (!project || !plan || !testcase) return of(null);
        return this.testCaseService
          .getTestCaseStats(project, plan, +testcase)
          .pipe(catchError(() => of(null)));
      }),
    );

  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';

@Component({
  selector: 'app-test-case-version-run-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    TestRunStatusBadgeComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './test-case-version-run-detail.component.html',
  styleUrls: ['./test-case-version-run-detail.component.scss'],
})
export class TestCaseVersionRunDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private runsService = inject(TestCaseVersionService);
  private router = inject(Router);

  item$!: Observable<TestPlanRunItem>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;
  testCaseIdentifier!: number;
  versionNumber!: number;

  ngOnInit(): void {
    this.item$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const version = params['version'];
        const runId = params['runId'];
        if (!project || !testcase || !version || !runId) {
          return of(null as any);
        }
        this.projectKey = project;
        this.testCaseIdentifier = +testcase;
        this.versionNumber = +version;
        return this.runsService.getRunById(project, runId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load run item';
            return of(null as any);
          })
        );
      })
    );
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCase;
    const key = tc.testSuite?.project?.projectKey ?? this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }

  backToRuns(): void {
    const queryParams = {
      project: this.projectKey,
      testcase: this.testCaseIdentifier,
      version: this.versionNumber,
      tab: 'runs'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

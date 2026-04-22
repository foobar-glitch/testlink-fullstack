import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestPlanRunItemService } from '../../../../core/services/test-plan-run-item.service';
import { TestPlanRunService } from '../../../../core/services/test-plan-run.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestPlanRunItem, TestRunStatus } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-run-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    TestRunStatusBadgeComponent,
  ],
  templateUrl: './test-plan-run-item-list.component.html',
  styleUrls: ['./test-plan-run-item-list.component.scss'],
})
export class TestPlanRunItemListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly runItemService = inject(TestPlanRunItemService);
  private readonly runService = inject(TestPlanRunService);

  items$!: Observable<TestPlanRunItem[]>;
  runName$!: Observable<string>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;
  testRunId!: string;

  ngOnInit(): void {
    this.items$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testRunId = params['testRunId'];
        if (!project || !testRunId) return of([]);
        this.projectKey = project;
        this.testRunId = testRunId;
        return this.runItemService.getRunItems(project, testRunId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load run items';
            return of([]);
          })
        );
      })
    );

    this.runName$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testRunId = params['testRunId'];
        if (!project || !testRunId) return of('Test Run');
        return this.runService.getTestRunById(project, testRunId).pipe(
          map(run => run.name),
          catchError(() => of('Test Run'))
        );
      })
    );
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCase;
    const key = tc.testSuite?.project?.projectKey ?? this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }

  getBadgeStatus(status: TestRunStatus): string {
    return status.toLowerCase();
  }

  viewItem(item: TestPlanRunItem): void {
    const queryParams = {
      project: this.projectKey,
      testRunId: this.testRunId,
      runItemId: item.testRunItemId,
      tab: 'run-item-detail'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  backToRuns(): void {
    const queryParams = {
      project: this.projectKey,
      tab: 'runs'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

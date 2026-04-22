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
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestPlanRunItem } from '../../../../core/models/testexecution';

@Component({
  selector: 'app-test-plan-run-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent,
    TestRunStatusBadgeComponent,
  ],
  templateUrl: './test-plan-run-item-detail.component.html',
  styleUrls: ['./test-plan-run-item-detail.component.scss'],
})
export class TestPlanRunItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemService = inject(TestPlanRunItemService);
  private readonly runService = inject(TestPlanRunService);

  item$!: Observable<TestPlanRunItem>;
  runName$!: Observable<string>;
  errorMessage = '';

  // Context from query params
  projectKey!: string;
  testRunId!: string;

  ngOnInit(): void {
    this.item$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const runItemId = params['runItemId'];
        if (!project || !runItemId) return of(null as any);
        this.projectKey = project;
        return this.itemService.getRunItemById(project, runItemId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load run item';
            return of(null as any);
          })
        );
      })
    );

    // Get the test run name – requires testRunId from query params
    this.runName$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testRunId = params['testRunId'];
        if (!project || !testRunId) return of('Test Run');
        this.testRunId = testRunId;
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

  backToItems(): void {
    const queryParams = {
      project: this.projectKey,
      testRunId: this.testRunId,
      tab: 'run-items'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

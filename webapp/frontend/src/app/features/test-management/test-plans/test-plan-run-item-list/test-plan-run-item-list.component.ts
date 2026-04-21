import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
export class TestPlanRunItemListComponent {
  private readonly route          = inject(ActivatedRoute);
  private readonly runItemService = inject(TestPlanRunItemService);
  private readonly runService     = inject(TestPlanRunService);
  private readonly router         = inject(Router);

  readonly projectKey: string;
  readonly testPlanId: string;
  readonly testRunId:  string;

  items$:   Observable<TestPlanRunItem[]>;
  runName$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.testPlanId = this.route.snapshot.paramMap.get('testPlanId')!;
    this.testRunId  = this.route.snapshot.paramMap.get('testRunId')!;

    this.items$ = this.runItemService
      .getRunItems(this.projectKey, this.testPlanId, this.testRunId)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load run items';
          return of([]);
        })
      );

    this.runName$ = this.runService
      .getTestRunById(this.projectKey, this.testPlanId, this.testRunId)
      .pipe(
        map(run => run.name),
        catchError(() => of('Test Run'))
      );
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCase;
    // project is optional on TestSuite — fall back to the route projectKey
    const key = tc.testSuite?.project?.projectKey ?? this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }

  getBadgeStatus(status: TestRunStatus): string {
    return status.toLowerCase();
  }

  viewItem(item: TestPlanRunItem): void {
    this.router.navigate([
      '/projects/project-key', this.projectKey,
      'testplans', this.testPlanId,
      'runs', this.testRunId,
      'items', item.testRunItemId,
    ]);
  }
}

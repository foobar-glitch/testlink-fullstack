import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TestPlanRunItemService } from '../../../../core/services/test-plan-run-item.service';
import { TestPlanRunService } from '../../../../core/services/test-plan-run.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

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
export class TestPlanRunItemDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly itemService = inject(TestPlanRunItemService);
  private readonly runService = inject(TestPlanRunService);

  readonly projectKey: string;
  readonly testPlanId: string;
  readonly testRunId: string;
  readonly itemId: string;

  item$: Observable<TestPlanRunItem>;
  runName$: Observable<string>;
  errorMessage = '';

  constructor() {
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;
    this.testPlanId = this.route.snapshot.paramMap.get('testPlanId')!;
    this.testRunId = this.route.snapshot.paramMap.get('testRunId')!;
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;

    this.item$ = this.itemService
      .getRunItemById(this.projectKey, this.testPlanId, this.testRunId, this.itemId)
      .pipe(
        catchError((err) => {
          this.errorMessage = err.message || 'Failed to load run item';
          return of(null as any);
        }),
      );

    this.runName$ = this.runService
      .getTestRunById(this.projectKey, this.testPlanId, this.testRunId)
      .pipe(
        map((run) => run.name),
        catchError(() => of('Test Run')),
      );
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCase;
    const projectKey = tc.testSuite?.project?.projectKey ?? 'UNKNOWN';
    return `${projectKey}-${tc.identifierNumber}`;
  }
}

// src/app/features/test-plan-run-item-detail/test-plan-run-item-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  TestRunStatusBadgeComponent
} from '../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestPlanRunItemService } from '../../../core/services/test-plan-run-item.service';
import { TestPlanRunService } from '../../../core/services/test-plan-run.service';
import { TestPlanRunItem } from '../../../core/models/testexecution';


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
  private readonly itemService = inject(TestPlanRunItemService);
  private readonly runService = inject(TestPlanRunService);

  projectKey!: string;
  testPlanId!: string;
  testRunId!: string;
  runItemId!: string;

  item$!: Observable<TestPlanRunItem>;
  runName$!: Observable<string>;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectKey = params['project'] || '';
      this.testPlanId = params['plan'] || '';
      this.testRunId = params['run'] || '';
      this.runItemId = params['runItemId'] || '';

      if (!this.projectKey || !this.runItemId) {
        this.errorMessage = 'Missing required parameters.';
        this.item$ = of(null as any);
        this.runName$ = of('Test Run');
        return;
      }

      // Correct service call: only projectKey and itemId (no testPlanId/testRunId needed)
      this.item$ = this.itemService.getRunItemById(this.projectKey, this.runItemId).pipe(
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load run item';
          return of(null as any);
        })
      );

      this.runName$ = this.runService
        .getTestRunById(this.projectKey, this.testPlanId, this.testRunId)
        .pipe(
          map(run => run.name),
          catchError(() => of('Test Run'))
        );
    });
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCaseVersion.testCase;
    const key = tc.testSuite?.project?.projectKey || this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }
}

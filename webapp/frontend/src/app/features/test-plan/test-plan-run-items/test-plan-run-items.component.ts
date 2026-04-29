// src/app/features/test-plan-run-items/test-plan-run-items.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import {
  TestRunStatusBadgeComponent
} from '../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { TestPlanRunItemService } from '../../../core/services/test-plan-run-item.service';
import { TestPlanRunService } from '../../../core/services/test-plan-run.service';
import { TestPlanRunItem } from '../../../core/models/testexecution';


@Component({
  selector: 'app-test-plan-run-items',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    TestRunStatusBadgeComponent,
  ],
  templateUrl: './test-plan-run-items.component.html',
  styleUrls: ['./test-plan-run-items.component.scss'],
})
export class TestPlanRunItemsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly runItemService = inject(TestPlanRunItemService);
  private readonly runService = inject(TestPlanRunService);
  private readonly router = inject(Router);

  projectKey!: string;
  testPlanId!: string;
  testRunId!: string;

  items$!: Observable<TestPlanRunItem[]>;
  runName$!: Observable<string>;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectKey = params['project'] || '';
      this.testPlanId = params['plan'] || '';
      this.testRunId = params['run'] || '';

      if (!this.projectKey || !this.testPlanId || !this.testRunId) {
        this.errorMessage = 'Missing required parameters.';
        this.items$ = of([]);
        this.runName$ = of('Test Run');
        return;
      }

      // The service method expects (projectKey, testRunId, testPlanId) – adjust order
      this.items$ = this.runItemService
        .getRunItems(this.projectKey, this.testRunId, this.testPlanId)
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
    });
  }

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCaseVersion.testCase;
    const proj = tc.testSuite?.project;
    const key = proj ? proj.projectKey : this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }

  viewItem(item: TestPlanRunItem): void {
    this.router.navigate(['/test-plans/run-item-detail'], {
      queryParams: {
        project: this.projectKey,
        plan: this.testPlanId,
        run: this.testRunId,
        runItemId: item.testRunItemId,
      }
    });
  }
}

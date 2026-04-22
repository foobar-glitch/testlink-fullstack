import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TestCaseVersionRunsService } from '../../../../core/services/test-case-version-runs.service';
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

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
  template: `
    <div class="run-detail-container">
      <header class="header">
        <h2>Run Item Detail</h2>
        <button class="back-btn" [routerLink]="['/projects/project-key', projectKey, 'suite', suiteId, 'testcase-identifier', testCaseIdentifier, 'versions', versionNumber, 'runs']">
          ← Back to Runs
        </button>
      </header>

      <app-error-banner *ngIf="errorMessage" [message]="errorMessage" (dismissed)="errorMessage = ''"></app-error-banner>

      <ng-container *ngIf="item$ | async as item; else loading">
        <div class="detail-card">
          <div class="section">
            <h3>Test Case</h3>
            <div class="info-row">
              <span class="label">Identifier</span>
              <span class="value identifier">{{ getTestCaseIdentifier(item) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Title</span>
              <span class="value">{{ item.testCase.title }}</span>
            </div>
            <div class="info-row">
              <span class="label">Description</span>
              <span class="value">{{ item.testCase.description || '—' }}</span>
            </div>
          </div>

          <div class="section">
            <h3>Version</h3>
            <div class="info-row">
              <span class="label">Version Number</span>
              <span class="value">v{{ item.testCaseVersion.versionNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status</span>
              <span class="value">
                <app-status-badge [status]="item.testCaseVersion.status"></app-status-badge>
              </span>
            </div>
          </div>

          <div class="section">
            <h3>Execution</h3>
            <div class="info-row">
              <span class="label">Status</span>
              <span class="value">
                <app-test-run-status-badge [status]="item.status"></app-test-run-status-badge>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Assigned To</span>
              <span class="value">{{ item.assignedTo?.username || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Executed By</span>
              <span class="value">{{ item.executedBy?.username || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Executed At</span>
              <span class="value">{{ item.executedAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="section" *ngIf="item.notes">
            <h3>Notes</h3>
            <p class="notes">{{ item.notes }}</p>
          </div>

          <div class="meta">
            Created by {{ item.stamp.createdBy.username }} on {{ item.stamp.timeStamp.createdAt | date:'medium' }}
            <span *ngIf="item.stamp.timeStamp.updatedAt"> · Updated {{ item.stamp.timeStamp.updatedAt | date:'medium' }}</span>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <app-spinner label="Loading run details..."></app-spinner>
      </ng-template>
    </div>
  `,
  styles: [`
    .run-detail-container { max-width: 800px; margin: 0 auto; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e8e8e8; padding-bottom: 12px; }
    .back-btn { background: none; border: 1px solid #e8e8e8; padding: 6px 14px; border-radius: 6px; cursor: pointer; }
    .detail-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .section { margin-bottom: 20px; }
    h3 { font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #e8e8e8; padding-bottom: 6px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .label { width: 130px; font-weight: 600; color: #777; }
    .value { color: #111; }
    .identifier { font-family: monospace; color: #6c63ff; font-weight: 600; }
    .notes { background: #f2f2f2; padding: 12px; border-radius: 6px; }
    .meta { margin-top: 20px; padding-top: 16px; border-top: 1px solid #e8e8e8; font-size: 13px; color: #777; }
  `]
})
export class TestCaseVersionRunDetailComponent {
  private route = inject(ActivatedRoute);
  private runsService = inject(TestCaseVersionRunsService);

  projectKey = this.route.snapshot.paramMap.get('projectKey')!;
  suiteId = this.route.snapshot.paramMap.get('suiteId')!;
  testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
  versionNumber = Number(this.route.snapshot.paramMap.get('versionNumber'));
  runId = this.route.snapshot.paramMap.get('runId')!;

  item$: Observable<TestPlanRunItem> = this.runsService.getRunById(
    this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber, this.runId
  ).pipe(
    catchError(err => {
      this.errorMessage = err.message || 'Failed to load run item';
      return of(null as any);
    })
  );

  errorMessage = '';

  getTestCaseIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCase;
    const key = tc.testSuite?.project?.projectKey ?? this.projectKey;
    return `${key}-${tc.identifierNumber}`;
  }
}

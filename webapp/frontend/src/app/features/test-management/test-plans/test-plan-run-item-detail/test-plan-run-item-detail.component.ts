import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestPlanRunItemService } from '../../../../core/services/test-plan-run-item.service';
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
  private readonly itemService = inject(TestPlanRunItemService);

  item$!: Observable<TestPlanRunItem | null>;
  errorMessage = '';
  projectKey!: string;

  ngOnInit(): void {
    this.item$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const runItemId = params['runItemId'];
        if (!project || !runItemId) return of(null);
        this.projectKey = project;
        return this.itemService.getRunItemById(project, runItemId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load run item';
            return of(null);
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
}

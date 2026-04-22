import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TestCaseVersionRunsService } from '../../../../core/services/test-case-version-runs.service'; // to be created
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';
import { ExecutionTableComponent } from '../../../test-explorer/execution-table/execution-table.component';

@Component({
  selector: 'app-test-case-version-runs',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent, TestRunStatusBadgeComponent, ExecutionTableComponent],
  templateUrl: './test-case-version-runs.component.html',
  styleUrls: ['./test-case-version-runs.component.scss']
})
export class TestCaseVersionRunsComponent {
  private route = inject(ActivatedRoute);
  private runsService = inject(TestCaseVersionRunsService);
  private router = inject(Router);

  projectKey = this.route.snapshot.paramMap.get('projectKey')!;
  suiteId = this.route.snapshot.paramMap.get('suiteId')!;
  testCaseIdentifier = Number(this.route.snapshot.paramMap.get('testCaseIdentifier'));
  versionNumber = Number(this.route.snapshot.paramMap.get('versionNumber'));

  runs$: Observable<TestPlanRunItem[]> = this.runsService.getRunsForVersion(
    this.projectKey, this.suiteId, this.testCaseIdentifier, this.versionNumber
  ).pipe(catchError(() => of([])));

  errorMessage = '';

  onRunSelected(item: TestPlanRunItem): void {
    this.router.navigate([
      '/projects/project-key', this.projectKey,
      'suite', this.suiteId,
      'testcase-identifier', this.testCaseIdentifier,
      'versions', this.versionNumber,
      'runs', item.testRunItemId
    ]);
  }
}

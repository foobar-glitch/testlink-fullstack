import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { ExecutionTableComponent } from '../../../test-explorer/execution-table/execution-table.component';
import { TestCaseVersionService } from '../../../../core/services/test-case-version.service';

@Component({
  selector: 'app-test-case-version-runs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    ExecutionTableComponent,
  ],
  templateUrl: './test-case-version-runs.component.html',
  styleUrls: ['./test-case-version-runs.component.scss']
})
export class TestCaseVersionRunsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private runsService = inject(TestCaseVersionService);

  runs$!: Observable<TestPlanRunItem[]>;
  errorMessage = '';

  // Context values
  projectKey!: string;
  testCaseIdentifier!: number;
  versionNumber!: number;

  ngOnInit(): void {
    this.runs$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        const version = params['version'];
        if (!project || !testcase || !version) return of([]);
        this.projectKey = project;
        this.testCaseIdentifier = +testcase;
        this.versionNumber = +version;
        return this.runsService.getRunsForVersion(project, +testcase, +version).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load runs';
            return of([]);
          })
        );
      })
    );
  }

  onRunSelected(item: TestPlanRunItem): void {
    const queryParams = {
      project: this.projectKey,
      testcase: this.testCaseIdentifier,
      version: this.versionNumber,
      runId: item.testRunItemId,
      tab: 'run-detail'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }

  backToVersion(): void {
    const queryParams = {
      project: this.projectKey,
      testcase: this.testCaseIdentifier,
      version: this.versionNumber,
      tab: 'steps'
    };
    this.router.navigate(['/explorer'], { queryParams });
  }
}

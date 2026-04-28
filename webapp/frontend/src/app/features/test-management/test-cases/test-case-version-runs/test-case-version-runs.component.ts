import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestPlanRunItem } from '../../../../core/models/testexecution';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { ExecutionTableComponent } from '../../../execution-view/execution-table/execution-table.component';
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

  projectKey!: string;
  suiteId!: string;
  testCaseIdentifier!: number;
  versionNumber!: number;
  testPlanId!: string;

  ngOnInit(): void {
    this.runs$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const suite = params['suite'];
        const testcase = params['testcase'];
        const version = params['version'];
        const testPlanId = params['plan'];

        if (!project || !testcase || !version) {
          return of([]);
        }

        this.projectKey = project;
        this.suiteId = suite || '';
        this.testCaseIdentifier = +testcase;
        this.versionNumber = +version;

        return this.runsService.getRunsForVersion(project, +testcase, +version, testPlanId).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load runs';
            return of([]);
          })
        );
      })
    );
  }

  onRunSelected(item: TestPlanRunItem): void {
    this.router.navigate(['/explorer'], {
      queryParams: {
        project: this.projectKey,
        suite: this.suiteId,
        testcase: this.testCaseIdentifier,
        version: this.versionNumber,
        runItemId: item.testRunItemId,
        tab: 'run-detail'
      },
      queryParamsHandling: 'merge'
    });
  }
}

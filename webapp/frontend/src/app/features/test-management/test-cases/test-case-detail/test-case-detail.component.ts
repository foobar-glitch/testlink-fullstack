import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TestCase } from '../../../../core/models/testsuite';

@Component({
  selector: 'app-test-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorBannerComponent,
    StatusBadgeComponent
  ],
  templateUrl: './test-case-detail.component.html',
  styleUrls: ['./test-case-detail.component.scss']
})
export class TestCaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly testCaseService = inject(TestCaseService);

  testCase$!: Observable<TestCase | null>;
  errorMessage = '';

  projectKey!: string;

  ngOnInit(): void {
    this.testCase$ = this.route.queryParams.pipe(
      switchMap(params => {
        const project = params['project'];
        const testcase = params['testcase'];
        if (!project || !testcase) return of(null);
        this.projectKey = project;
        return this.testCaseService.getTestCase(project, +testcase).pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load test case';
            return of(null);
          })
        );
      })
    );
  }
}

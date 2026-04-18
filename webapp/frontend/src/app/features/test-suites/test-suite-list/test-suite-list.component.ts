import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { TestSuite } from '../../../core/models/testsuite';

@Component({
  selector: 'app-test-suite-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-suite-list.component.html',
  styleUrls: ['./test-suite-list.component.scss']
})
export class TestSuiteListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testSuiteService = inject(TestSuiteService);

  readonly projectId: number;
  readonly suites$: Observable<TestSuite[]>;
  errorMessage = '';

  constructor() {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    this.suites$ = this.testSuiteService.getTestSuitesByProject(this.projectId).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load test suites';
        return of([]);
      })
    );
  }

  toggleSuite(suite: TestSuite, event: Event): void {
    event.stopPropagation();
    suite.expanded = !suite.expanded;
  }

  selectSuite(suite: TestSuite): void {
    this.router.navigate(['/projects', this.projectId, 'suites', suite.testSuiteId, 'cases']);
  }

  // No ?. or ?? needed — children and expanded are always set by the service
  hasChildren(suite: TestSuite): boolean {
    return suite.children.length > 0;
  }

  isExpanded(suite: TestSuite): boolean {
    return suite.expanded;
  }
}

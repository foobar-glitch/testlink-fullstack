import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { TestSuite } from '../../../core/models';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-test-suite-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './test-suite-list.component.html',
  styleUrls: ['./test-suite-list.component.scss']
})
export class TestSuiteListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testSuiteService = inject(TestSuiteService);

  projectId: number;
  suites$: Observable<TestSuite[]>;
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
    suite.expanded = !suite.expanded;   // simple toggle, no HTTP call
  }

  selectSuite(suite: TestSuite): void {
    this.router.navigate(['/projects', this.projectId, 'suites', suite.testSuiteId, 'cases']);
  }

  isExpanded(suite: TestSuite): boolean {
    return suite.expanded || false;
  }

  hasChildren(suite: TestSuite): boolean {
    return suite?.children?.length > 0;
  }
}

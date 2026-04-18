import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { ProjectService } from '../../../core/services/project.service';
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
  private readonly projectService = inject(ProjectService);

  readonly projectKey: string;
  readonly suites$: Observable<TestSuite[]>;
  errorMessage = '';

  constructor() {
    // Extract the project key from the route parameters
    this.projectKey = this.route.snapshot.paramMap.get('projectKey')!;

    // Fetch the project by its key to get the project ID, then load test suites
    this.suites$ = this.projectService.getProjectByKey(this.projectKey).pipe(
      switchMap(project => this.testSuiteService.getTestSuitesByProject(project.projectId)),
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
    // Navigate using the new project-key based URL structure
    this.router.navigate([
      '/projects/project-key',
      this.projectKey,
      'suites',
      suite.testSuiteId,
      'cases'
    ]);
  }

  hasChildren(suite: TestSuite): boolean {
    return suite.children.length > 0;
  }

  isExpanded(suite: TestSuite): boolean {
    return suite.expanded;
  }
}

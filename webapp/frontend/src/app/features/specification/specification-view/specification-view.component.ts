// ─── specification-view.component.ts ─────────────────────────────────────────
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { TestCaseService } from '../../../core/services/test-case.service';
import { TestSuiteService } from '../../../core/services/test-suite.service';
import { TestCase } from '../../../core/models/testsuite';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TestCaseTableComponent } from '../../execution/components/test‑case‑table/test‑case‑table.component';
import { TestCaseDetailComponent } from '../../execution/details/test-case-detail/test-case-detail.component';
import { TestCaseVersionContentComponent } from '../../execution/details/test-case-version-content/test-case-version-content.component';
import { TestCaseVersionListComponent } from '../../execution/details/test-case-version-list/test-case-version-list.component';
import { TestCaseVersionService } from '../../../core/services/test-case-version.service';

type SpecTab = 'details' | 'steps' | 'versions';

@Component({
  selector: 'app-specification-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    TestCaseTableComponent,
    TestCaseDetailComponent,
    TestCaseVersionContentComponent,
    TestCaseVersionListComponent,
  ],
  templateUrl: './specification-view.component.html',
  styleUrls: ['./specification-view.component.scss'],
})
export class SpecificationViewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly casesSvc = inject(TestCaseService);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly versionSvc = inject(TestCaseVersionService);

  // URL-derived streams (READ ONLY)
  readonly projectKey$ = this.route.queryParams.pipe(
    map(p => p['project'] as string | null),
    distinctUntilChanged(),
  );

  readonly suiteId$ = this.route.queryParams.pipe(
    map(p => p['suite'] as string | null),
    distinctUntilChanged(),
  );

  readonly testCaseId$ = this.route.queryParams.pipe(
    map(p => p['testcase'] as string | null),
    distinctUntilChanged(),
  );

  readonly activeTab$ = this.route.queryParams.pipe(
    map(p => (p['tab'] || 'details') as SpecTab),
    distinctUntilChanged(),
  );

  // Data streams
  testCasesForSuite$: Observable<TestCase[]> = of([]);
  suiteName$: Observable<string | null> = of(null);

  private subs = new Subscription();

  ngOnInit(): void {
    // Load test cases whenever project/suite changes
    this.subs.add(
      this.route.queryParams.pipe(
        map(p => ({ projectKey: p['project'] as string | null, suiteId: p['suite'] as string | null })),
        distinctUntilChanged((a, b) => a.projectKey === b.projectKey && a.suiteId === b.suiteId),
      ).subscribe(({ projectKey, suiteId }) => {
        if (projectKey && suiteId) {
          this.testCasesForSuite$ = this.casesSvc
            .getTestCases(projectKey, suiteId, true)
            .pipe(catchError(() => of([])));

          this.suiteName$ = this.suitesSvc.getTestSuiteHierarchy(projectKey, suiteId).pipe(
            map(h => h.current.name),
            catchError(() => of(null)),
          );
        } else {
          this.testCasesForSuite$ = of([]);
          this.suiteName$ = of(null);
        }
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setTab(tab: SpecTab): void {
    if (tab === 'steps') {
      const project = this.route.snapshot.queryParams['project'];
      const testcase = this.route.snapshot.queryParams['testcase'];
      if (project && testcase) {
        this.versionSvc.getVersionsByTestCase(project, +testcase)
          .pipe(
            catchError(() => of([]))
          )
          .subscribe(versions => {
            if (versions.length) {
              const latest = Math.max(...versions.map(v => v.versionNumber));
              this.router.navigate([], {
                queryParams: { version: latest, tab: 'steps' },
                queryParamsHandling: 'merge',
                preserveFragment: true,
              });
            } else {
              // No versions exist – fall back to Versions tab
              this.router.navigate([], {
                queryParams: { tab: 'versions' },
                queryParamsHandling: 'merge',
                preserveFragment: true,
              });
            }
          });
        return;
      }
    }

    // For other tabs (details, versions), just set the tab
    this.router.navigate([], {
      queryParams: { tab, version: null },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }

  onCaseSelected(tc: TestCase): void {
    this.router.navigate([], {
      queryParams: {
        testcase: tc.identifierNumber,
        suite: tc.testSuite.testSuiteId,
        tab: 'details',
        version: null,
      },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
}

// test-plan-overview.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';
import { TestPlan, TestPlanRun } from '../../../../core/models/testexecution';
import { ErrorBannerComponent } from '../../../../shared/components/error-banner/error-banner.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TestPlanRunService } from '../../../../core/services/test-plan-run.service';


@Component({
  selector: 'app-test-plan-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SpinnerComponent,
    ErrorBannerComponent
  ],
  templateUrl: './test-plan-overview.component.html',
  styleUrls: ['./test-plan-overview.component.scss']
})
export class TestPlanOverviewComponent implements OnInit {
  @Input() plan!: TestPlan;
  @Input() projectKey!: string;

  private runService = inject(TestPlanRunService);

  runs$: Observable<TestPlanRun[]> = of([]);
  stats$: Observable<{ total: number }> = of({ total: 0 });

  private filterSearch$ = new BehaviorSubject<string>('');
  private sortState = { column: 'name', direction: 'asc' as 'asc' | 'desc' };

  filteredRuns$: Observable<TestPlanRun[]> = of([]);
  errorMessage = '';

  ngOnInit(): void {
    this.runs$ = this.runService.getTestRunsByTestPlan(this.projectKey, this.plan.testPlanId).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Failed to load test runs';
        return of([]);
      })
    );

    this.stats$ = this.runs$.pipe(
      map(runs => ({ total: runs.length }))
    );

    this.filteredRuns$ = combineLatest([this.runs$, this.filterSearch$]).pipe(
      map(([runs, search]) => this.filterAndSortRuns(runs, search)),
      startWith([])
    );
  }

  private filterAndSortRuns(runs: TestPlanRun[], search: string): TestPlanRun[] {
    let filtered = runs;
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.environment?.toLowerCase().includes(term) ||
        r.build?.toLowerCase().includes(term)
      );
    }
    return this.sortRuns(filtered);
  }

  setSearchFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterSearch$.next(input.value);
  }

  sortRuns(runs: TestPlanRun[]): TestPlanRun[] {
    const { column, direction } = this.sortState;
    return [...runs].sort((a, b) => {
      let valA: any, valB: any;
      switch (column) {
        case 'name': valA = a.name; valB = b.name; break;
        case 'environment': valA = a.environment || ''; valB = b.environment || ''; break;
        case 'build': valA = a.build || ''; valB = b.build || ''; break;
        case 'created': valA = a.stamp.timeStamp.createdAt; valB = b.stamp.timeStamp.createdAt; break;
        default: return 0;
      }
      const compare = valA < valB ? -1 : valA > valB ? 1 : 0;
      return direction === 'asc' ? compare : -compare;
    });
  }

  setSort(column: string): void {
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }
    this.filterSearch$.next(this.filterSearch$.value);
  }

  getSortIcon(column: string): string {
    if (this.sortState.column !== column) return '↕';
    return this.sortState.direction === 'asc' ? '↑' : '↓';
  }

  getRunItemsLink(run: TestPlanRun): string[] {
    return [
      '/projects/project-key',
      this.projectKey,
      'testplans',
      this.plan.testPlanId,
      'runs',
      run.testPlanRunId,
      'items'
    ];
  }
}

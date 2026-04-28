import {
  Component,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { TestSuite, TestCase } from '../../../../core/models/testsuite';
import { TestCaseService } from '../../../../core/services/test-case.service';
import { TreeStateService } from '../../../../core/services/tree-state.service';
import { ContextService } from '../../../../core/services/context.service';

@Component({
  selector: 'app-suite-tree-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './test‑suite‑tree‑node.component.html',
  styleUrls: ['./test‑suite‑tree‑node.component.scss'],
})
export class TestSuiteTreeNodeComponent implements OnInit, OnDestroy {
  @Input() suite!: TestSuite;
  @Input() depth = 0;

  private readonly casesSvc = inject(TestCaseService);
  private readonly treeState = inject(TreeStateService);
  private readonly ctx = inject(ContextService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  testCases$: Observable<TestCase[]> = of([]);
  private casesLoaded = false;
  private paramsSub?: Subscription;

  // Selection state derived from URL (READ ONLY)
  selectedSuiteId: string | null = null;
  selectedCaseId: string | null = null;

  ngOnInit(): void {
    this.paramsSub = this.route.queryParams.subscribe((params) => {
      this.selectedSuiteId = params['suite'] || null;
      this.selectedCaseId = params['testcase'] || null;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  get isOpen(): boolean {
    return this.treeState.isExpanded(this.suite.testSuiteId);
  }

  get isSuiteSelected(): boolean {
    return this.selectedSuiteId === this.suite.testSuiteId;
  }

  isCaseSelected(tc: TestCase): boolean {
    return this.selectedCaseId === String(tc.identifierNumber);
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    this.treeState.toggle(this.suite.testSuiteId);
    if (this.treeState.isExpanded(this.suite.testSuiteId)) {
      this.loadCases();
    }
    this.cdr.markForCheck();
  }

  // In test‑suite‑tree‑node.component.ts
  onSuiteClick(): void {
    this.treeState.toggle(this.suite.testSuiteId);
    if (this.treeState.isExpanded(this.suite.testSuiteId)) {
      this.loadCases();
    }

    const projectKey = this.ctx.snapshot.projectKey;
    const planId = this.ctx.snapshot.testPlanId;

    // Navigate with tab = 'overview' (this shows Test Cases tab because suite is present)
    this.router.navigate([], {
      queryParams: {
        project: projectKey,
        plan: planId,
        suite: this.suite.testSuiteId,
        testcase: null,
        version: null,
        tab: 'overview', // ← This is correct! The template will show "Test Cases" tab
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });

    this.cdr.markForCheck();
  }

  // In test‑suite‑tree‑node.component.ts
  onCaseClick(event: Event, tc: TestCase): void {
    event.stopPropagation();

    const projectKey = this.ctx.snapshot.projectKey;
    const planId = this.ctx.snapshot.testPlanId;

    this.router.navigate([], {
      queryParams: {
        project: projectKey,
        plan: planId,
        suite: this.suite.testSuiteId,
        testcase: tc.identifierNumber,
        tab: 'details',
        version: null, // ← clear version
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });

    this.cdr.markForCheck(); // ← Add this
  }

  getCaseColor(_tc: TestCase): string {
    return '#bbb';
  }

  private loadCases(): void {
    if (this.casesLoaded) return;
    const projectKey = this.ctx.snapshot.projectKey;
    if (!projectKey) return;

    this.casesLoaded = true;
    this.testCases$ = this.casesSvc
      .getTestCases(projectKey, this.suite.testSuiteId)
      .pipe(catchError(() => of([])));
    this.cdr.markForCheck();
  }
}

// ─── spec-suite-tree-node.component.ts ────────────────────────────────────────
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  selector: 'app-spec-suite-tree-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './spec-suite-tree-node.component.html',
  styleUrls: ['./spec-suite-tree-node.component.scss'],
})
export class SpecSuiteTreeNodeComponent implements OnInit, OnDestroy {
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

  selectedSuiteId: string | null = null;
  selectedCaseId: string | null = null;

  ngOnInit(): void {
    this.paramsSub = this.route.queryParams.subscribe(params => {
      this.selectedSuiteId = params['suite'] || null;
      this.selectedCaseId = params['testcase'] || null;
      this.cdr.markForCheck();
    });

    // If tree already includes cases (from pre-loaded DTO), use them directly
    if (this.suite.testCases && this.suite.testCases.length > 0) {
      this.casesLoaded = true;
      this.testCases$ = of(this.suite.testCases);
    }
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
    if (this.treeState.isExpanded(this.suite.testSuiteId) && !this.casesLoaded) {
      this.loadCases();
    }
    this.cdr.markForCheck();
  }

  onSuiteClick(): void {
    this.treeState.toggle(this.suite.testSuiteId);
    if (this.treeState.isExpanded(this.suite.testSuiteId)) {
      this.loadCases();
    }

    const projectKey = this.ctx.snapshot.projectKey;

    // Navigate WITHOUT plan param — spec view is plan-agnostic
    this.router.navigate([], {
      queryParams: {
        project: projectKey,
        suite: this.suite.testSuiteId,
        testcase: null,
        version: null,
        tab: 'overview',
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });

    this.cdr.markForCheck();
  }

  onCaseClick(event: Event, tc: TestCase): void {
    event.stopPropagation();

    const projectKey = this.ctx.snapshot.projectKey;

    this.router.navigate([], {
      queryParams: {
        project: projectKey,
        suite: this.suite.testSuiteId,
        testcase: tc.identifierNumber,
        tab: 'details',
        version: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });

    this.cdr.markForCheck();
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

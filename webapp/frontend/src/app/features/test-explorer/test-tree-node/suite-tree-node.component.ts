import {
  Component,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TestSuite, TestCase } from '../../../core/models/testsuite';
import { TestCaseService } from '../../../core/services/test-case.service';
import { TreeStateService } from '../../../core/services/tree-state.service';
import { ContextService } from '../../../core/services/context.service';

@Component({
  selector: 'app-suite-tree-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './suite-tree-node.component.html',
  styleUrls: ['./suite-tree-node.component.scss'],
})
export class SuiteTreeNodeComponent implements OnInit {
  @Input() suite!: TestSuite;
  @Input() depth = 0;

  private readonly casesSvc  = inject(TestCaseService);
  private readonly treeState = inject(TreeStateService);
  private readonly ctx       = inject(ContextService);
  private readonly cdr       = inject(ChangeDetectorRef);

  // Always an Observable (never null) — avoids the TS2769 type error with async pipe
  testCases$: Observable<TestCase[]> = of([]);
  private casesLoaded = false;

  ngOnInit(): void {
    this.treeState.selection$.subscribe(() => this.cdr.markForCheck());
  }

  get isOpen(): boolean {
    return this.treeState.isExpanded(this.suite.testSuiteId);
  }

  get isSuiteSelected(): boolean {
    return this.treeState.isSelectedSuite(this.suite.testSuiteId);
  }

  isCaseSelected(tc: TestCase): boolean {
    return this.treeState.isSelectedCase(String(tc.identifierNumber));
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    this.treeState.toggle(this.suite.testSuiteId);
    if (this.treeState.isExpanded(this.suite.testSuiteId)) {
      this.loadCases();
    }
    this.cdr.markForCheck();
  }

  onSuiteClick(): void {
    this.treeState.toggle(this.suite.testSuiteId);
    this.treeState.selectSuite(this.suite);
    if (this.treeState.isExpanded(this.suite.testSuiteId)) {
      this.loadCases();
    }
    this.cdr.markForCheck();
  }

  onCaseClick(event: Event, tc: TestCase): void {
    event.stopPropagation();
    this.treeState.selectCase(tc);
    this.cdr.markForCheck();
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

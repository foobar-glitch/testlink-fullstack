// ─── specification-shell.component.ts ────────────────────────────────────────
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
import { Subscription, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { TestSuiteService } from '../../../core/services/test-suite.service';
import { ContextService } from '../../../core/services/context.service';
import { TreeStateService } from '../../../core/services/tree-state.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SpecSuiteTreeNodeComponent } from '../components/spec-suite-tree-node/spec-suite-tree-node.component';
import { TestSuite, TestSuiteHierarchyDTO } from '../../../core/models/testsuite';

@Component({
  selector: 'app-specification-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    SpecSuiteTreeNodeComponent,
  ],
  templateUrl: './specification-shell.component.html',
  styleUrls: ['./specification-shell.component.scss'],
})
export class SpecificationShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly suitesSvc = inject(TestSuiteService);
  private readonly ctx = inject(ContextService);
  private readonly treeState = inject(TreeStateService);
  private readonly cdr = inject(ChangeDetectorRef);

  rootSuites: TestSuite[] = [];
  loading = false;
  errorMsg = '';

  private subs = new Subscription();

  readonly projectKey$ = this.route.queryParams.pipe(
    map(params => params['project'] as string | null),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.subs.add(
      this.projectKey$.subscribe(projectKey => {
        if (projectKey) {
          this.ctx.setProject(projectKey);
          this.loadTree(projectKey);
        } else {
          this.rootSuites = [];
          this.cdr.markForCheck();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadTree(projectKey: string): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.suitesSvc.getTestSuiteTree(projectKey)
      .pipe(catchError(err => {
        this.errorMsg = err.message || 'Failed to load test suites';
        return of([]);
      }))
      .subscribe((dtos: TestSuiteHierarchyDTO[]) => {
        this.rootSuites = this.suitesSvc.buildSuiteTree(dtos);   // <-- use the service
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Build a tree of TestSuite nodes from a flat list of TestSuiteHierarchyDTOs.
   * Only root suites (parent === null) appear at the top level; their children
   * are assembled recursively from the same flat list.
   */
  private buildTree(dtos: TestSuiteHierarchyDTO[]): TestSuite[] {
    // Map each DTO's current suite into a TestSuite node
    const nodeMap = new Map<string, TestSuite>();

    for (const dto of dtos) {
      const node: TestSuite = {
        ...dto.current,
        children: [],
        expanded: this.treeState.isExpanded(dto.current.testSuiteId),
        testCases: dto.testCases ?? [],
      };
      nodeMap.set(dto.current.testSuiteId, node);
    }

    // Wire up parent → children relationships
    const roots: TestSuite[] = [];
    for (const dto of dtos) {
      const node = nodeMap.get(dto.current.testSuiteId)!;
      if (dto.parent === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(dto.parent.testSuiteId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not in this page yet — treat as root
          roots.push(node);
        }
      }
    }

    return roots;
  }
}

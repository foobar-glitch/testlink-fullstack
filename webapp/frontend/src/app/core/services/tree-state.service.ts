import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TestSuite } from '../models/testsuite';
import { TestCase } from '../models/testsuite';

export type TreeSelection =
  | { type: 'none' }
  | { type: 'suite'; suite: TestSuite }
  | { type: 'case'; testCase: TestCase };

@Injectable({ providedIn: 'root' })
export class TreeStateService {
  private _selection$ = new BehaviorSubject<TreeSelection>({ type: 'none' });
  readonly selection$ = this._selection$.asObservable();

  private expandedIds = new Set<string>();

  isExpanded(id: string): boolean {
    return this.expandedIds.has(id);
  }

  toggle(id: string): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  expandAll(suites: TestSuite[]): void {
    this.collectIds(suites).forEach(id => this.expandedIds.add(id));
  }

  collapseAll(): void {
    this.expandedIds.clear();
  }

  selectSuite(suite: TestSuite): void {
    this._selection$.next({ type: 'suite', suite });
  }

  selectCase(testCase: TestCase): void {
    this._selection$.next({ type: 'case', testCase });
  }

  clearSelection(): void {
    this._selection$.next({ type: 'none' });
  }

  isSelectedSuite(id: string): boolean {
    const s = this._selection$.value;
    return s.type === 'suite' && s.suite.testSuiteId === id;
  }

  isSelectedCase(id: string): boolean {
    const s = this._selection$.value;
    return s.type === 'case' && String(s.testCase.identifierNumber) === id;
  }

  private collectIds(suites: TestSuite[]): string[] {
    const ids: string[] = [];
    for (const s of suites) {
      ids.push(s.testSuiteId);
      if (s.children?.length) ids.push(...this.collectIds(s.children));
    }
    return ids;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TestSuite } from '../models/testsuite';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TreeStateService {
  private expandedIds = new Set<string>();

  private treeDataSubject = new BehaviorSubject<TestSuite[]>([]);
  readonly treeData$ = this.treeDataSubject.asObservable();

  setTreeData(data: TestSuite[]): void {
    this.treeDataSubject.next(data);
  }

  waitForTree(): Observable<TestSuite[]> {
    return this.treeData$.pipe(filter(data => data.length > 0));
  }

  get treeData(): TestSuite[] {
    return this.treeDataSubject.value;
  }

  findSuiteById(id: string): TestSuite | undefined {
    return this.findRecursive(this.treeData, id);
  }

  private findRecursive(suites: TestSuite[], id: string): TestSuite | undefined {
    for (const s of suites) {
      if (s.testSuiteId === id) return s;
      if (s.children?.length) {
        const found = this.findRecursive(s.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

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

  expand(id: string): void {
    this.expandedIds.add(id);
  }

  expandAll(suites: TestSuite[]): void {
    this.collectIds(suites).forEach((id) => this.expandedIds.add(id));
  }

  collapseAll(): void {
    this.expandedIds.clear();
  }

  private collectIds(suites: TestSuite[]): string[] {
    const ids: string[] = [];
    for (const s of suites) {
      ids.push(s.testSuiteId);
      if (s.children?.length) ids.push(...this.collectIds(s.children));
    }
    return ids;
  }

  /** Expand path to a specific suite ID */
  expandPathTo(targetId: string): void {
    const path = this.findPathTo(this.treeData, targetId);
    path.forEach(id => this.expandedIds.add(id));
  }

  private findPathTo(suites: TestSuite[], targetId: string, currentPath: string[] = []): string[] {
    for (const s of suites) {
      if (s.testSuiteId === targetId) {
        return [...currentPath, s.testSuiteId];
      }
      if (s.children?.length) {
        const found = this.findPathTo(s.children, targetId, [...currentPath, s.testSuiteId]);
        if (found.length) return found;
      }
    }
    return [];
  }
}

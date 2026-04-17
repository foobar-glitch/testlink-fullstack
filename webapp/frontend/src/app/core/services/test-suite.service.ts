import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchy, TestSuiteHierarchyDTO, TestSuiteItem } from '../models';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Returns a flat list of root-level TestSuite tree nodes, each carrying
   * their direct children as nested TestSuite nodes (with `children` and
   * `expanded` always set). Uses the GET /projects/:id/suites endpoint.
   */
  getTestSuitesByProject(projectId: number): Observable<TestSuite[]> {
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects/${projectId}/suites`, {
        withCredentials: true,
      })
      .pipe(map(dtos => dtos.map(dto => this.dtoToTreeNode(dto.current, dto.children))));
  }

  /**
   * Returns a full TestSuiteHierarchy for a single suite, including
   * its resolved parent and children as proper TestSuite tree nodes.
   * Uses the GET /projects/:pid/suites/:sid endpoint.
   */
  getTestSuite(projectId: number, suiteId: number): Observable<TestSuiteHierarchy> {
    return this.http
      .get<TestSuiteHierarchyDTO>(
        `${this.apiUrl}projects/${projectId}/suites/${suiteId}`,
        { withCredentials: true }
      )
      .pipe(
        map(dto => ({
          current: this.itemToTreeNode(dto.current),
          parent: dto.parent ? this.itemToTreeNode(dto.parent) : null,
          children: dto.children.map(child => this.itemToTreeNode(child)),
        }))
      );
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Converts a TestSuiteItem + its raw children list into a TestSuite tree node.
   * Recurses so that each child is also a proper TestSuite node.
   */
  private dtoToTreeNode(item: TestSuiteItem, children: TestSuiteItem[]): TestSuite {
    return {
      ...item,
      // Each child from the backend is a flat TestSuiteItem with no grandchildren.
      // We give them empty children arrays — they'll be populated on demand
      // when the user navigates into that suite (via getTestSuite).
      children: children.map(child => this.itemToTreeNode(child)),
      expanded: false,
    };
  }

  /**
   * Converts a bare TestSuiteItem into a TestSuite leaf node
   * (no children yet, not expanded).
   */
  private itemToTreeNode(item: TestSuiteItem): TestSuite {
    return {
      ...item,
      children: [],
      expanded: false,
    };
  }
}

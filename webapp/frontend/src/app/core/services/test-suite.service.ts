// test-suite.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchy, TestSuiteHierarchyDTO, TestSuiteItem } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Fetch test suite tree using the project's business key.
   * Backend endpoint: GET /projects/project-key/{projectKey}/suites
   */
  getTestSuitesByProjectKey(projectKey: string): Observable<TestSuite[]> {
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects/project-key/${projectKey}/suites`, {
        withCredentials: true,
      })
      .pipe(map(dtos => dtos.map(dto => this.dtoToTreeNode(dto.current, dto.children))));
  }

  /**
   * Fetch a single test suite hierarchy by project key and suite ID.
   * Assumes backend provides: GET /projects/project-key/{projectKey}/suites/{suiteId}
   */
  getTestSuiteByProjectKeyAndId(projectKey: string, suiteId: number): Observable<TestSuiteHierarchy> {
    return this.http
      .get<TestSuiteHierarchyDTO>(`${this.apiUrl}projects/project-key/${projectKey}/suites/${suiteId}`, {
        withCredentials: true,
      })
      .pipe(
        map(dto => ({
          current: this.itemToTreeNode(dto.current),
          parent: dto.parent ? this.itemToTreeNode(dto.parent) : null,
          children: (dto.children || []).map(child => this.itemToTreeNode(child)),
        }))
      );
  }

  /**
   * Legacy method: fetch test suites by numeric project ID.
   * Backend endpoint: GET /projects/{projectId}/suites
   */
  getTestSuitesByProject(projectId: number): Observable<TestSuite[]> {
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects/${projectId}/suites`, {
        withCredentials: true,
      })
      .pipe(map(dtos => dtos.map(dto => this.dtoToTreeNode(dto.current, dto.children))));
  }

  /**
   * Convert a flat DTO item and its raw children into a full tree node.
   */
  private dtoToTreeNode(item: TestSuiteItem, children: TestSuiteItem[]): TestSuite {
    return {
      ...item,
      children: children.map(child => this.itemToTreeNode(child)),
      expanded: false,
    };
  }

  /**
   * Convert a bare TestSuiteItem into a leaf tree node (no children loaded yet).
   */
  private itemToTreeNode(item: TestSuiteItem): TestSuite {
    return {
      ...item,
      children: [],
      expanded: false,
    };
  }
}

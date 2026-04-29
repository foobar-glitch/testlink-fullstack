import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestCase, TestSuite, TestSuiteHierarchy, TestSuiteHierarchyDTO, TestSuiteItem, TestSuiteStats } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Fetch suite hierarchy filtered by a specific test plan.
   * Endpoint: GET /projects/testplan?projectKey={projectKey}&testPlan={testPlan}
   */
  getFilteredSuites(projectKey: string, testPlan: string): Observable<TestSuite[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlan', testPlan);
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects`, { withCredentials: true, params })
      .pipe(
        map(dtos => dtos.map(dto => this.dtoToFilteredTreeNode(dto.current, dto.children, dto.testCases ?? [])))
      );
  }

  private dtoToFilteredTreeNode(item: TestSuiteItem, children: TestSuiteItem[], cases: TestCase[]): TestSuite {
    return {
      ...item,
      children: children.map(child => this.itemToTreeNode(child)), // children from hierarchy never have preloaded cases
      expanded: false,
      testCases: cases,
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


  /**
   * Get statistics for a specific test suite.
   * Endpoint: GET /projects/view/stats?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteStats(projectKey: string, suiteId: string): Observable<TestSuiteStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('suiteId', suiteId);

    return this.http.get<TestSuiteStats>(`${this.apiUrl}projects/view/stats`, {
      withCredentials: true,
      params
    });
  }
}

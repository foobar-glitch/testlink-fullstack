import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchyDTO, TestSuitePlanStats } from '../models/testsuite';

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
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}test-suites`, { withCredentials: true, params })
      .pipe(
        map(dtos => this.buildSuiteTree(dtos))
      );
  }

  private normalizeSuite(node: any): TestSuite {
    return {
      ...node.current,
      expanded: false,
      testCases: node.testCases ?? [],
      children: (node.children ?? []).map((child: any) =>
        this.normalizeSuite(child)
      )
    };
  }

  public buildSuiteTree(dtos: TestSuiteHierarchyDTO[]): TestSuite[] {
    return dtos.map(dto => this.normalizeSuite(dto));
  }




  /**
   * Get statistics for a specific test suite.
   * Endpoint: GET /projects/view/stats?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteTreeStats(projectKey: string, testPlanId: string, suiteIds: string[]): Observable<TestSuitePlanStats[]> {
    let params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId);

    // Append each suite ID individually so the backend receives a list
    suiteIds.forEach(id => {
      params = params.append('suiteIds', id);
    });

    return this.http.get<TestSuitePlanStats[]>(`${this.apiUrl}test-suites/view/stats/testplan/tree`, {
      withCredentials: true,
      params,
    });
  }

  getTestSuiteStats(projectKey: string, testPlanId: string, suiteId: string): Observable<TestSuitePlanStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId)
      .set('suiteId', suiteId);

    return this.http.get<TestSuitePlanStats>(`${this.apiUrl}test-suites/view/stats/testplan`, {
      withCredentials: true,
      params,
    });
  }

  // ── NEW: Full suite tree for a project (no plan filter) ───────
  /**
   * Get the complete test suite tree for a project.
   * Endpoint: GET /test-suites?projectKey={projectKey}
   */
  getTestSuiteTree(projectKey: string): Observable<TestSuiteHierarchyDTO[]> {
    const params = new HttpParams().set('projectKey', projectKey);
    return this.http.get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}test-suites`, {
      withCredentials: true,
      params,
    });
  }

  // ── NEW: Single suite hierarchy ────────────────────────────────
  /**
   * Get the hierarchy (parent, children, test cases) for a specific suite.
   * Endpoint: GET /test-suites/hierarchy?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteHierarchy(
    projectKey: string,
    suiteId: string,
  ): Observable<TestSuiteHierarchyDTO> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('suiteId', suiteId);
    return this.http.get<TestSuiteHierarchyDTO>(
      `${this.apiUrl}test-suites/hierarchy`,
      { withCredentials: true, params },
    );
  }
}

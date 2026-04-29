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

  private buildSuiteTree(dtos: TestSuiteHierarchyDTO[]): TestSuite[] {
    return dtos.map(dto => this.normalizeSuite(dto));
  }



  /**
   * Get statistics for a specific test suite.
   * Endpoint: GET /projects/view/stats?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteStats(projectKey: string, suiteId: string): Observable<TestSuiteStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('suiteId', suiteId);

    return this.http.get<TestSuiteStats>(`${this.apiUrl}test-suites/view/stats`, {
      withCredentials: true,
      params
    });
  }
}

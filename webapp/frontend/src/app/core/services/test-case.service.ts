import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test cases belonging to a specific test suite.
   * Endpoint: GET /testcases?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestCases(projectKey: string, suiteId: string): Observable<TestCase[]> {
    const params = new HttpParams().set('projectKey', projectKey).set('suiteId', suiteId);
    return this.http.get<TestCase[]>(`${this.apiUrl}testcases`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get a single test case by its identifier.
   * Endpoint: GET /testcases/view?projectKey={projectKey}&suiteId={suiteId}&testCaseIdentifier={testCaseIdentifier}
   */
  getTestCase(
    projectKey: string,
    testCaseIdentifier: number,
  ): Observable<TestCase> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString());
    return this.http.get<TestCase>(`${this.apiUrl}testcases/view`, {
      withCredentials: true,
      params,
    });
  }
}

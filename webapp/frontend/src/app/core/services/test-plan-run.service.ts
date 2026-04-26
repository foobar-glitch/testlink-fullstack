import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlanRun } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestPlanRunService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test runs for a given test plan.
   * Endpoint: GET /testruns?projectKey={projectKey}&testPlanId={testPlanId}
   */
  getTestRunsByTestPlan(projectKey: string, testPlanId: string): Observable<TestPlanRun[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId);
    return this.http.get<TestPlanRun[]>(`${this.apiUrl}testruns`, {
      withCredentials: true,
      params
    });
  }

  /**
   * Get a single test run by its ID.
   * Endpoint: GET /testruns/view?projectKey={projectKey}&testRunId={testRunId}
   */
  getTestRunById(projectKey: string, testPlanId: string,  testRunId: string): Observable<TestPlanRun> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId)
      .set('testRunId', testRunId);
    return this.http.get<TestPlanRun>(`${this.apiUrl}testruns/view`, {
      withCredentials: true,
      params
    });
  }
}

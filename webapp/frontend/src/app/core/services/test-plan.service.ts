import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlan, TestPlanStats } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestPlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test plans for a given project.
   * Endpoint: GET /testplans?projectKey={projectKey}
   */
  getTestPlansByProjectKey(projectKey: string): Observable<TestPlan[]> {
    const params = new HttpParams().set('projectKey', projectKey);
    return this.http.get<TestPlan[]>(`${this.apiUrl}testplans`, {
      withCredentials: true,
      params
    });
  }

  /**
   * Get a single test plan by its ID.
   * Endpoint: GET /testplans/view?projectKey={projectKey}&testPlanId={testPlanId}
   */
  getTestPlan(projectKey: string, testPlanId: string): Observable<TestPlan> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId);
    return this.http.get<TestPlan>(`${this.apiUrl}testplans/view`, {
      withCredentials: true,
      params
    });
  }

  getTestPlanStats(projectKey: string, testPlanId: string): Observable<TestPlanStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId);
    return this.http.get<TestPlanStats>(`${this.apiUrl}testplans/view/stats`, {
      withCredentials: true,
      params
    });
  }

}

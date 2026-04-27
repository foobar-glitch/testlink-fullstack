import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestStepResult } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestStepResultService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all execution results for a specific test step.
   * Endpoint: GET /test-step-results?projectKey={projectKey}&stepId={stepId}
   */
  getResultsByStep(projectKey: string, testPlanId: string, stepId: string): Observable<TestStepResult[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId)
      .set('stepId', stepId);
    return this.http.get<TestStepResult[]>(`${this.apiUrl}test-step-results`, {
      withCredentials: true,
      params
    });
  }

  /**
   * Get a single execution result by its action ID.
   * Endpoint: GET /test-step-results/view?projectKey={projectKey}&actionId={actionId}
   */
  getResultById(projectKey: string, actionId: string): Observable<TestStepResult> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('actionId', actionId);
    return this.http.get<TestStepResult>(`${this.apiUrl}test-step-results/view`, {
      withCredentials: true,
      params
    });
  }
}

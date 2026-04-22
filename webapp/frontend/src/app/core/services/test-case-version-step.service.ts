import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersionStep } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionStepService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all steps for a specific test case version.
   * Endpoint: GET /test-steps?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}&version={version}
   */
  getSteps(
    projectKey: string,
    testCaseIdentifier: number,
    versionNumber: number,
  ): Observable<TestCaseVersionStep[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString())
      .set('version', versionNumber.toString());
    return this.http.get<TestCaseVersionStep[]>(`${this.apiUrl}test-steps`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get a single step by its public ID.
   * Endpoint: GET /test-steps/step?projectKey={projectKey}&stepId={stepId}
   */
  getStepById(projectKey: string, stepId: string): Observable<TestCaseVersionStep> {
    const params = new HttpParams().set('projectKey', projectKey).set('stepId', stepId);
    return this.http.get<TestCaseVersionStep>(`${this.apiUrl}test-steps/step`, {
      withCredentials: true,
      params,
    });
  }
}

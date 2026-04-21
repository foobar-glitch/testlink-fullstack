import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import from testsuite — the canonical full type (with stamp + testCaseVersionContent)
import { TestCaseVersionStep } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionStepService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getSteps(
    projectKey: string,
    suiteId: string,
    testCaseIdentifier: number,
    versionNumber: number
  ): Observable<TestCaseVersionStep[]> {
    return this.http.get<TestCaseVersionStep[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}/content/steps`,
      { withCredentials: true }
    );
  }

  getStepById(
    projectKey: string,
    suiteId: string,
    testCaseIdentifier: number,
    versionNumber: number,
    stepId: string
  ): Observable<TestCaseVersionStep> {
    return this.http.get<TestCaseVersionStep>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}/content/steps/${stepId}`,
      { withCredentials: true }
    );
  }
}

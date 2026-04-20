import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestStepResult } from '../models/testexecution';


@Injectable({ providedIn: 'root' })
export class TestStepResultService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all execution results for a specific test step.
   * Endpoint: GET /projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{version}/content/steps/{stepId}/action
   */
  getResultsByStep(
    projectKey: string,
    suiteId: string,
    testCaseIdentifier: number,
    versionNumber: number,
    stepId: string
  ): Observable<TestStepResult[]> {
    return this.http.get<TestStepResult[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}/content/steps/${stepId}/action`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single execution result by ID.
   * Endpoint: GET /projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{version}/content/steps/{stepId}/action/{actionId}
   */
  getResultById(
    projectKey: string,
    suiteId: string,
    testCaseIdentifier: number,
    versionNumber: number,
    stepId: string,
    actionId: string
  ): Observable<TestStepResult> {
    return this.http.get<TestStepResult>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}/content/steps/${stepId}/action/${actionId}`,
      { withCredentials: true }
    );
  }
}

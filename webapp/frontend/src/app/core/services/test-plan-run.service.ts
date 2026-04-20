import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlanRun } from '../models/testexecution';


@Injectable({ providedIn: 'root' })
export class TestPlanRunService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test runs for a given test plan.
   * Endpoint: GET /projects/project-key/{projectKey}/testplans/{testPlanId}/testruns
   */
  getTestRunsByTestPlan(projectKey: string, testPlanId: string): Observable<TestPlanRun[]> {
    return this.http.get<TestPlanRun[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single test run by ID.
   * Endpoint: GET /projects/project-key/{projectKey}/testplans/{testPlanId}/testruns/{testRunId}
   */
  getTestRunById(projectKey: string, testPlanId: string, testRunId: string): Observable<TestPlanRun> {
    return this.http.get<TestPlanRun>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns/${testRunId}`,
      { withCredentials: true }
    );
  }
}

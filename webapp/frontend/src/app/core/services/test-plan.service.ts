import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlan } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestPlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test plans for a given project (by project key).
   * Endpoint: GET /projects/project-key/{projectKey}/testplans
   */
  getTestPlansByProjectKey(projectKey: string): Observable<TestPlan[]> {
    return this.http.get<TestPlan[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single test plan by its ID.
   * Endpoint: GET /projects/project-key/{projectKey}/testplans/{testPlanId}
   */
  getTestPlan(projectKey: string, testPlanId: number): Observable<TestPlan> {
    return this.http.get<TestPlan>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}`,
      { withCredentials: true }
    );
  }
}

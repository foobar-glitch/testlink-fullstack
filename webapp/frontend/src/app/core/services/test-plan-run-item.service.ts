import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlanRunItem } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestPlanRunItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all run items for a specific test run.
   * Endpoint: GET /projects/project-key/{projectKey}/testplans/{testPlanId}/testruns/{testRunId}/items
   */
  getRunItems(projectKey: string, testPlanId: number, testRunId: number): Observable<TestPlanRunItem[]> {
    return this.http.get<TestPlanRunItem[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns/${testRunId}/items`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single run item by ID.
   * Endpoint: GET /projects/project-key/{projectKey}/testplans/{testPlanId}/testruns/{testRunId}/items/{testRunItemId}
   */
  getRunItemById(
    projectKey: string,
    testPlanId: number,
    testRunId: number,
    testRunItemId: number
  ): Observable<TestPlanRunItem> {
    return this.http.get<TestPlanRunItem>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns/${testRunId}/items/${testRunItemId}`,
      { withCredentials: true }
    );
  }
}

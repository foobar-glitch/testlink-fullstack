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
  getRunItems(projectKey: string, testPlanId: string, testRunId: string): Observable<TestPlanRunItem[]> {
    return this.http.get<TestPlanRunItem[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns/${testRunId}/items`,
      { withCredentials: true }
    );
  }

  // test-plan-run-item.service.ts
  getRunItemById(
    projectKey: string,
    testPlanId: string,
    testRunId: string,
    itemId: string
  ): Observable<TestPlanRunItem> {
    return this.http.get<TestPlanRunItem>(
      `${this.apiUrl}projects/project-key/${projectKey}/testplans/${testPlanId}/testruns/${testRunId}/items/${itemId}`,
      { withCredentials: true }
    );
  }

}

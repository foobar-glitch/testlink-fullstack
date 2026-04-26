import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestPlanRunItem } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestPlanRunItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all run items for a specific test run.
   * Endpoint: GET /test-run-items?projectKey={projectKey}&testRunId={testRunId}
   */

  getRunItems(projectKey: string, testRunId: string, testPlanId: string): Observable<TestPlanRunItem[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId)
      .set('testRunId', testRunId);
    return this.http.get<TestPlanRunItem[]>(`${this.apiUrl}test-run-items`, {
      withCredentials: true,
      params
    });
  }

  /**
   * Get a single run item by its ID.
   * Endpoint: GET /test-run-items/view?projectKey={projectKey}&testRunItemId={itemId}
   */
  getRunItemById(projectKey: string, itemId: string): Observable<TestPlanRunItem> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testRunItemId', itemId);
    return this.http.get<TestPlanRunItem>(`${this.apiUrl}test-run-items/view`, {
      withCredentials: true,
      params
    });
  }

}

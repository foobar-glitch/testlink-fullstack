// test-suite.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestSuite } from '../models';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * GET /projects/{projectId}/suites
   * Returns the root tree (nested or flat? We'll handle both)
   */
  getTestSuitesByProject(projectId: number): Observable<TestSuite[]> {
    return this.http.get<TestSuite[]>(`${this.apiUrl}projects/${projectId}/suites`, {
      withCredentials: true
    });
  }

  /**
   * GET /projects/{projectId}/suites/{suiteId}/children
   */
  getChildSuites(projectId: number, suiteId: number): Observable<TestSuite[]> {
    return this.http.get<TestSuite[]>(
      `${this.apiUrl}projects/${projectId}/suites/${suiteId}/children`,
      { withCredentials: true }
    );
  }
}

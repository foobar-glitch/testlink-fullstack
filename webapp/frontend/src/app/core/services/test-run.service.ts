// src/app/core/services/test-case.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test cases belonging to a specific test suite.
   * Endpoint: GET /projects/:projectId/suites/:suiteId/cases
   */
  getTestCases(projectId: number, suiteId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(
      `${this.apiUrl}projects/${projectId}/suites/${suiteId}/cases`,
      { withCredentials: true }
    );
  }
}

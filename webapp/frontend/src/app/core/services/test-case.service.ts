// test-case.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all test cases belonging to a specific test suite.
   * Endpoint: GET /projects/project-key/{projectKey}/suites/{suiteId}/cases
   */
  getTestCases(projectKey: string, suiteId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/suites/${suiteId}/cases`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single test case by its identifier.
   * Endpoint: GET /projects/project-key/{projectKey}/testcase-identifier/{testCaseIdentifier}
   */
  getTestCase(projectKey: string, testCaseIdentifier: number): Observable<TestCase> {
    return this.http.get<TestCase>(
      `${this.apiUrl}projects/project-key/${projectKey}/testcase-identifier/${testCaseIdentifier}`,
      { withCredentials: true }
    );
  }
}

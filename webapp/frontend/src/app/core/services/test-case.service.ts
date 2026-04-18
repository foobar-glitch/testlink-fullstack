import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCase } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTestCases(projectId: number, suiteId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(
      `${this.apiUrl}projects/${projectId}/suites/${suiteId}/cases`,
      { withCredentials: true }
    );
  }

  getTestCase(projectKey: string, testCaseIdentifier: number): Observable<TestCase> {
    return this.http.get<TestCase>(
      `${this.apiUrl}projects/project-key/${projectKey}/testcase-identifier/${testCaseIdentifier}`,
      { withCredentials: true }
    );
  }
}

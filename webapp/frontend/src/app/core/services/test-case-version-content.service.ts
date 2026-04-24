import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersionContent } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get the content of a specific test case version.
   * Endpoint: GET /test-case-version-content?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}&version={versionNumber}
   */
  getContent(
    projectKey: string,
    testCaseIdentifier: number,
    versionNumber: number,
  ): Observable<TestCaseVersionContent> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString())
      .set('version', versionNumber.toString());
    return this.http.get<TestCaseVersionContent>(`${this.apiUrl}test-case-version-content`, {
      withCredentials: true,
      params,
    });
  }
}

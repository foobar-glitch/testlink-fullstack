import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersionContent } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getContent(
    projectKey: string,
    suiteId: number,
    testCaseIdentifier: number,
    versionNumber: number
  ): Observable<TestCaseVersionContent> {
    return this.http.get<TestCaseVersionContent>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}`,
      { withCredentials: true }
    );
  }
}

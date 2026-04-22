import { TestPlanRunItem } from '../models/testexecution';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionRunsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getRunsForVersion(projectKey: string, suiteId: string, testCaseId: number, version: number): Observable<TestPlanRunItem[]> {
    return this.http.get<TestPlanRunItem[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseId}/versions/${version}/runs`,
      { withCredentials: true }
    );
  }

  getRunById(
    projectKey: string,
    suiteId: string,
    testCaseId: number,
    version: number,
    runId: string
  ): Observable<TestPlanRunItem> {
    return this.http.get<TestPlanRunItem>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseId}/versions/${version}/runs/${runId}`,
      { withCredentials: true }
    );
  }
}

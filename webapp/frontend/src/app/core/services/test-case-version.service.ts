import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersion } from '../models/testsuite';


@Injectable({ providedIn: 'root' })
export class TestCaseVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getVersionsByTestCase(projectId: number, testCaseId: number): Observable<TestCaseVersion[]> {
    return this.http.get<TestCaseVersion[]>(
      `${this.apiUrl}projects/${projectId}/testcases/${testCaseId}/versions`,
      { withCredentials: true }
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersion } from '../models/testsuite';


@Injectable({ providedIn: 'root' })
export class TestCaseVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getVersionsByTestCase(projectKey: string, testCaseIdentifier: number): Observable<TestCaseVersion[]> {
    return this.http.get<TestCaseVersion[]>(
      `${this.apiUrl}projects/testcase/${projectKey}/${testCaseIdentifier}/versions`,
      { withCredentials: true }
    );
  }

  getSpecificVersion(projectKey: string, testCaseIdentifier: number, versionNumber: number): Observable<TestCaseVersion[]> {
    return this.http.get<TestCaseVersion[]>(
      `${this.apiUrl}project/testcase/${projectKey}/${testCaseIdentifier}/version/${versionNumber}`,
      { withCredentials: true }
    );
  }
}

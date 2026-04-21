import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersion, TestCaseVersionStats } from '../models/testsuite';


@Injectable({ providedIn: 'root' })
export class TestCaseVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getVersionsByTestCase(projectKey: string, testCaseIdentifier: number, suiteId: string): Observable<TestCaseVersion[]> {
    return this.http.get<TestCaseVersion[]>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions`,
      { withCredentials: true }
    );
  }

  getSpecificVersion(projectKey: string, testCaseIdentifier: number, versionNumber: number, suiteId: string): Observable<TestCaseVersion> {
    return this.http.get<TestCaseVersion>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/version/${versionNumber}`,
      { withCredentials: true }
    );
  }


  getVersionStats(
    projectKey: string,
    suiteId: string,
    testCaseIdentifier: number,
    versionNumber: number
  ): Observable<TestCaseVersionStats> {
    return this.http.get<TestCaseVersionStats>(
      `${this.apiUrl}projects/project-key/${projectKey}/suite/${suiteId}/testcase-identifier/${testCaseIdentifier}/versions/${versionNumber}/stats`,
      { withCredentials: true }
    );
  }
}

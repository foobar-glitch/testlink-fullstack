import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestCaseVersion, TestCaseVersionPlanStats } from '../models/testsuite';
import { TestPlanRunItem } from '../models/testexecution';

@Injectable({ providedIn: 'root' })
export class TestCaseVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all versions of a test case.
   * Endpoint: GET /test-case-versions?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}
   */
  getVersionsByTestCase(
    projectKey: string,
    testCaseIdentifier: number,
  ): Observable<TestCaseVersion[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString());
    return this.http.get<TestCaseVersion[]>(`${this.apiUrl}test-case-versions`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get a specific version of a test case.
   * Endpoint: GET /test-case-versions/view?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}&versionNumber={versionNumber}
   */
  getSpecificVersion(
    projectKey: string,
    testCaseIdentifier: number,
    versionNumber: number,
  ): Observable<TestCaseVersion> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString())
      .set('versionNumber', versionNumber.toString());
    return this.http.get<TestCaseVersion>(`${this.apiUrl}test-case-versions/view`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get execution statistics for a test case version.
   * Endpoint: GET /test-case-versions/view/stats?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}&versionNumber={versionNumber}
   */
  getVersionStats(
    projectKey: string,
    testPlanId: string,       // new parameter
    testCaseIdentifier: number,
    versionNumber: number,
  ): Observable<TestCaseVersionPlanStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testPlanId', testPlanId)   // include plan id
      .set('testCaseIdentifier', testCaseIdentifier.toString())
      .set('versionNumber', versionNumber.toString());
    return this.http.get<TestCaseVersionPlanStats>(`${this.apiUrl}test-case-versions/view/stats/testplan`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get all test runs for a test case version.
   * Endpoint: GET /test-case-versions/runs?projectKey={projectKey}&testCaseIdentifier={testCaseIdentifier}&versionNumber={versionNumber}
   */
  getRunsForVersion(
    projectKey: string,
    testCaseIdentifier: number,
    versionNumber: number,
    testPlanId: string,
  ): Observable<TestPlanRunItem[]> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('testCaseIdentifier', testCaseIdentifier.toString())
      .set('versionNumber', versionNumber.toString())
      .set('testPlanId', testPlanId)
    ;
    return this.http.get<TestPlanRunItem[]>(`${this.apiUrl}test-case-versions/runs`, {
      withCredentials: true,
      params,
    });
  }

  /**
   * Get a specific test run item by its ID.
   * Endpoint: GET /test-case-versions/runs/view?projectKey={projectKey}&runId={runId}
   */
  getRunById(projectKey: string, runId: string): Observable<TestPlanRunItem> {
    const params = new HttpParams().set('projectKey', projectKey).set('runId', runId);
    return this.http.get<TestPlanRunItem>(`${this.apiUrl}test-case-versions/runs/view`, {
      withCredentials: true,
      params,
    });
  }
}

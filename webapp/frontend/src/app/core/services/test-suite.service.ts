import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchy, TestSuiteHierarchyDTO, TestSuiteItem, TestSuiteStats } from '../models/testsuite';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Fetch test suite tree using the project's business key.
   * Endpoint: GET /projects?projectKey={projectKey}
   */
  getTestSuitesByProjectKey(projectKey: string): Observable<TestSuite[]> {
    const params = new HttpParams().set('projectKey', projectKey);
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects`, {
        withCredentials: true,
        params
      })
      .pipe(map(dtos => dtos.map(dto => this.dtoToTreeNode(dto.current, dto.children))));
  }

  /**
   * Fetch a single test suite hierarchy by project key and suite ID.
   * Endpoint: GET /projects/view?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteByProjectKeyAndId(projectKey: string, suiteId: string): Observable<TestSuiteHierarchy> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('suiteId', suiteId);
    return this.http
      .get<TestSuiteHierarchyDTO>(`${this.apiUrl}projects/view`, {
        withCredentials: true,
        params
      })
      .pipe(
        map(dto => ({
          current: this.itemToTreeNode(dto.current),
          parent: dto.parent ? this.itemToTreeNode(dto.parent) : null,
          children: (dto.children || []).map(child => this.itemToTreeNode(child)),
        }))
      );
  }


  /**
   * Convert a flat DTO item and its raw children into a full tree node.
   */
  private dtoToTreeNode(item: TestSuiteItem, children: TestSuiteItem[]): TestSuite {
    return {
      ...item,
      children: children.map(child => this.itemToTreeNode(child)),
      expanded: false,
    };
  }

  /**
   * Convert a bare TestSuiteItem into a leaf tree node (no children loaded yet).
   */
  private itemToTreeNode(item: TestSuiteItem): TestSuite {
    return {
      ...item,
      children: [],
      expanded: false,
    };
  }


  /**
   * Get statistics for a specific test suite.
   * Endpoint: GET /projects/view/stats?projectKey={projectKey}&suiteId={suiteId}
   */
  getTestSuiteStats(projectKey: string, suiteId: string): Observable<TestSuiteStats> {
    const params = new HttpParams()
      .set('projectKey', projectKey)
      .set('suiteId', suiteId);

    return this.http.get<TestSuiteStats>(`${this.apiUrl}projects/view/stats`, {
      withCredentials: true,
      params
    });
  }
}

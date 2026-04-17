import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchy } from '../models';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTestSuitesByProject(projectId: number): Observable<TestSuite[]> {
    return this.http.get<TestSuiteHierarchy[]>(`${this.apiUrl}projects/${projectId}/suites`, {
      withCredentials: true
    }).pipe(
      map(hierarchies => this.buildTree(hierarchies))
    );
  }

  private buildTree(hierarchies: TestSuiteHierarchy[]): TestSuite[] {
    return hierarchies.map(h => {
      const suite = h.current;
      suite.children = h.children || [];
      suite.expanded = false;
      return suite;
    });
  }
}

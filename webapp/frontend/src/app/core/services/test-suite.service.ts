import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TestSuite, TestSuiteHierarchy, TestSuiteHierarchyDTO, TestSuiteItem } from '../models';

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTestSuitesByProject(projectId: number): Observable<TestSuite[]> {
    return this.http
      .get<TestSuiteHierarchyDTO[]>(`${this.apiUrl}projects/${projectId}/suites`, {
        withCredentials: true,
      })
      .pipe(
        map(dtos => dtos.map(dto => this.toTreeNode(dto.current, dto.children ?? []))),
        catchError(err => {
          console.error(`Failed to load test suites for project ${projectId}`, err);
          return throwError(() => err);
        })
      );
  }

  getTestSuite(projectId: number, suiteId: number): Observable<TestSuiteHierarchy> {
    return this.http
      .get<TestSuiteHierarchyDTO>(
        `${this.apiUrl}projects/${projectId}/suites/${suiteId}`,
        { withCredentials: true }
      )
      .pipe(
        map(dto => ({
          current: this.toTreeNode(dto.current),
          parent: dto.parent ? this.toTreeNode(dto.parent) : null,
          children: (dto.children ?? []).map(child => this.toTreeNode(child)),
        })),
        catchError(err => {
          console.error(`Failed to load test suite ${suiteId}`, err);
          return throwError(() => err);
        })
      );
  }

  private toTreeNode(item: TestSuiteItem, children: TestSuiteItem[] = []): TestSuite {
    return {
      ...item,
      children: children.map(child => this.toTreeNode(child)),
      expanded: false,
    };
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TestCase, TestCaseFormData, PagedResponse, PageRequest } from '../models';
import { MOCK_TEST_CASES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private cases = [...MOCK_TEST_CASES];
  private nextId = Math.max(...MOCK_TEST_CASES.map(t => t.id)) + 1;

  getTestCases(projectId: number, req: PageRequest): Observable<PagedResponse<TestCase>> {
    // GET /api/projects/:pid/testcases?page=X&pageSize=Y&suiteId=Z&search=W
    let filtered = this.cases.filter(tc => tc.projectId === projectId);

    if (req.suiteId) {
      filtered = filtered.filter(tc => tc.suiteId === req.suiteId);
    }
    if (req.search?.trim()) {
      const q = req.search.toLowerCase();
      filtered = filtered.filter(tc => tc.title.toLowerCase().includes(q));
    }
    if (req.status) {
      filtered = filtered.filter(tc => tc.status === req.status);
    }

    const total = filtered.length;
    const start = (req.page - 1) * req.pageSize;
    const data = filtered.slice(start, start + req.pageSize);

    return of({
      data,
      total,
      page: req.page,
      pageSize: req.pageSize,
      totalPages: Math.ceil(total / req.pageSize)
    }).pipe(delay(250));
  }

  getTestCase(id: number): Observable<TestCase | undefined> {
    return of(this.cases.find(tc => tc.id === id)).pipe(delay(100));
  }

  createTestCase(projectId: number, formData: TestCaseFormData): Observable<TestCase> {
    const now = new Date().toISOString();
    const newCase: TestCase = {
      id: this.nextId++,
      projectId,
      suiteId: formData.suiteId,
      title: formData.title,
      description: formData.description,
      steps: formData.steps,
      expectedResult: formData.expectedResult,
      priority: formData.priority,
      status: 'active',
      version: 1,
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
    };
    this.cases.push(newCase);
    return of(newCase).pipe(delay(400));
  }

  updateTestCase(id: number, formData: TestCaseFormData): Observable<TestCase> {
    const idx = this.cases.findIndex(tc => tc.id === id);
    if (idx === -1) throw new Error('Test case not found');
    const updated: TestCase = {
      ...this.cases[idx],
      ...formData,
      version: this.cases[idx].version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.cases[idx] = updated;
    return of(updated).pipe(delay(400));
  }

  deleteTestCase(id: number): Observable<void> {
    this.cases = this.cases.filter(tc => tc.id !== id);
    return of(void 0).pipe(delay(300));
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestRun, TestExecution, ExecutionStatus, ExecutionUpdateRequest, RunSummary } from '../models';
import { MOCK_TEST_RUNS, MOCK_EXECUTIONS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class TestRunService {
  private runs = [...MOCK_TEST_RUNS];
  private executions = MOCK_EXECUTIONS.map(e => ({ ...e }));
  private nextRunId = Math.max(...MOCK_TEST_RUNS.map(r => r.id)) + 1;

  getTestRuns(projectId: number): Observable<TestRun[]> {
    // GET /api/projects/:pid/runs
    return of(this.runs.filter(r => r.projectId === projectId)).pipe(delay(200));
  }

  getTestRun(runId: number): Observable<TestRun | undefined> {
    return of(this.runs.find(r => r.id === runId)).pipe(delay(100));
  }

  createTestRun(projectId: number, name: string, description: string, suiteId: number | null): Observable<TestRun> {
    const now = new Date().toISOString();
    const newRun: TestRun = {
      id: this.nextRunId++,
      projectId,
      name,
      description,
      suiteId,
      suiteName: null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'admin',
      summary: { total: 0, pass: 0, fail: 0, blocked: 0, notRun: 0 }
    };
    this.runs.push(newRun);
    return of(newRun).pipe(delay(400));
  }

  getExecutions(runId: number): Observable<TestExecution[]> {
    // GET /api/runs/:id/executions
    return of(this.executions.filter(e => e.runId === runId)).pipe(delay(250));
  }

  updateExecution(executionId: number, update: ExecutionUpdateRequest): Observable<TestExecution> {
    // PUT /api/executions/:id  – optimistic update pattern
    const idx = this.executions.findIndex(e => e.id === executionId);
    if (idx === -1) throw new Error('Execution not found');

    this.executions[idx] = {
      ...this.executions[idx],
      status: update.status,
      notes: update.notes ?? this.executions[idx].notes,
      executedBy: 'admin',
      executedAt: new Date().toISOString(),
    };

    // Recalculate run summary
    this.recalculateSummary(this.executions[idx].runId);

    return of(this.executions[idx]).pipe(delay(200));
  }

  private recalculateSummary(runId: number): void {
    const runExecs = this.executions.filter(e => e.runId === runId);
    const summary: RunSummary = {
      total: runExecs.length,
      pass: runExecs.filter(e => e.status === 'pass').length,
      fail: runExecs.filter(e => e.status === 'fail').length,
      blocked: runExecs.filter(e => e.status === 'blocked').length,
      notRun: runExecs.filter(e => e.status === 'not_run').length,
    };
    const run = this.runs.find(r => r.id === runId);
    if (run) run.summary = summary;
  }
}

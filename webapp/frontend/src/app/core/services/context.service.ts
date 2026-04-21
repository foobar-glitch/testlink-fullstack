import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppContext {
  projectKey: string | null;
  testPlanId: string | null;
}

const STORAGE_KEY = 'tf_context';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private _ctx$ = new BehaviorSubject<AppContext>(this.load());
  readonly ctx$ = this._ctx$.asObservable();

  get snapshot(): AppContext {
    return this._ctx$.value;
  }

  setProject(projectKey: string): void {
    this.update({ projectKey, testPlanId: null });
  }

  setPlan(testPlanId: string): void {
    this.update({ ...this._ctx$.value, testPlanId });
  }

  private update(ctx: AppContext): void {
    this._ctx$.next(ctx);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx)); } catch {}
  }

  private load(): AppContext {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { projectKey: null, testPlanId: null };
  }
}

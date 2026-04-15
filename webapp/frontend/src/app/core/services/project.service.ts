import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Project, PagedResponse, PageRequest } from '../models';
import { MOCK_PROJECTS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly STORAGE_KEY = 'tf_project';

  private _activeProject$ = new BehaviorSubject<Project | null>(this.loadFromStorage());
  readonly activeProject$ = this._activeProject$.asObservable();

  get activeProject(): Project | null {
    return this._activeProject$.value;
  }

  getProjects(userId: number): Observable<Project[]> {
    // Mock: return all projects. In prod: GET /api/projects?userId=X withCredentials
    return of(MOCK_PROJECTS).pipe(delay(300));
  }

  selectProject(project: Project): void {
    this._activeProject$.next(project);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(project));
  }

  clearProject(): void {
    this._activeProject$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): Project | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) as Project : null;
    } catch {
      return null;
    }
  }
}

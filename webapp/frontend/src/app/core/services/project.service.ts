import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Project, PagedResponse, PageRequest, ApiResponse, ProjectMembership } from '../models';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly STORAGE_KEY = 'tf_project';
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private _activeProject$ = new BehaviorSubject<Project | null>(this.loadFromStorage());
  readonly activeProject$ = this._activeProject$.asObservable();

  get activeProject(): Project | null {
    return this._activeProject$.value;
  }

  getProjectMemberships(): Observable<ApiResponse<ProjectMembership[]>> {
    return this.http.get<ApiResponse<ProjectMembership[]>>(`${this.apiUrl}projects/assigned`, {
      withCredentials: true
    });
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

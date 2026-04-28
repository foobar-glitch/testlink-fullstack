import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectMembership, ProjectStats } from '../models/project';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all project memberships for the currently authenticated user.
   */
  getProjectMemberships(): Observable<ProjectMembership[]> {
    return this.http.get<ProjectMembership[]>(`${this.apiUrl}projects/assigned`, {
      withCredentials: true,
    });
  }

  getProjectByKey(projectKey: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}projects/project-key/${projectKey}`, {
      withCredentials: true,
    });
  }

  getProjectStats(projectKey: string): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.apiUrl}projects/project-key/${projectKey}/stats`, {
      withCredentials: true,
    });
  }


}

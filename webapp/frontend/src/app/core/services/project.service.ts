import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectMembership } from '../models';
import { environment } from '../../../environments/environment';

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
}

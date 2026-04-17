import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ProjectMembership } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get all project memberships for the currently authenticated user.
   */
  getProjectMemberships(): Observable<ApiResponse<ProjectMembership[]>> {
    return this.http.get<ApiResponse<ProjectMembership[]>>(`${this.apiUrl}projects/assigned`, {
      withCredentials: true,
    });
  }
}

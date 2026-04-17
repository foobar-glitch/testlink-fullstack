// project-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectMembership } from '../../../core/models';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent, RoleBadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  private projectService = inject(ProjectService);
  private auth = inject(AuthService);
  private router = inject(Router)

  memberships$: Observable<ProjectMembership[]>;
  errorMessage = '';

  constructor() {
    const user = this.auth.currentUser;
    if (user) {
      this.memberships$ = this.projectService.getProjectMemberships().pipe(
        map(response => response.data),
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load projects';
          return of([]);
        })
      );
    } else {
      this.errorMessage = 'Please log in to view projects.';
      this.memberships$ = of([]);
    }
  }

  selectProject(project: Project): void {
    this.projectService.selectProject(project);
    this.router.navigate(['/projects', project.projectId, 'suites']);
  }

  logout(): void {
    this.auth.logout();
  }
}

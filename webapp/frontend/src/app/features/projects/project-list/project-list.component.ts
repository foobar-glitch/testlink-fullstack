import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, filter, switchMap, startWith } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectMembership } from '../../../core/models';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent, RoleBadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  private readonly projectService = inject(ProjectService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  memberships$: Observable<ProjectMembership[]>;
  errorMessage = '';

  constructor() {
    this.memberships$ = this.auth.currentUser$.pipe(
      // Wait until the user is actually loaded
      filter(user => user !== null),
      // Once we have a user, switch to the HTTP call
      switchMap(() =>
        this.projectService.getProjectMemberships().pipe(
          catchError(err => {
            this.errorMessage = err.message || 'Failed to load projects';
            return of([]);
          })
        )
      ),
      // Emit an empty array immediately so the template shows loading state
      startWith([])
    );
  }

  selectProject(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'suites']);
  }

  logout(): void {
    this.auth.logout();
  }
}

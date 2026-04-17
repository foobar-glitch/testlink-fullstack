import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  private projectService = inject(ProjectService);
  private auth = inject(AuthService);

  projects$: Observable<Project[]>;
  errorMessage = '';

  constructor() {
    const user = this.auth.currentUser;
    if (user) {
      this.projects$ = this.projectService.getProjectMemberships().pipe(
        map(response => response.data.map(m => m.project)),
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load projects';
          return of([]);
        })
      );
    } else {
      this.errorMessage = 'Please log in to view projects.';
      this.projects$ = of([]);
    }
  }

  selectProject(project: Project): void {
    this.projectService.selectProject(project);
  }

  logout(): void {
    this.auth.logout();
  }
}

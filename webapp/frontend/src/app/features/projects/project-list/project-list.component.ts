import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models';
// 👇 Add these two imports
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  // 👇 Add SpinnerComponent and ErrorBannerComponent to the imports array
  imports: [CommonModule, RouterModule, SpinnerComponent, ErrorBannerComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private auth = inject(AuthService);

  projects: Project[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.projectService.getProjects(user.id).subscribe({
        next: (projects) => {
          this.projects = projects;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load projects';
          this.loading = false;
        }
      });
    }
  }

  selectProject(project: Project): void {
    this.projectService.selectProject(project);
    // Navigate later with Router
  }

  logout(): void {
    this.auth.logout();
  }
}
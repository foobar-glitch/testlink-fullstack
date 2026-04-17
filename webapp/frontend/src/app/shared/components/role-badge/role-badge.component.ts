import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRole } from '../../../core/models';



@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-badge.component.html',
  styleUrls: ['./role-badge.component.scss']
})
export class RoleBadgeComponent {
  @Input() role: ProjectRole = 'viewer';

  get badgeClass(): string {
    return this.role;
  }

  get label(): string {
    const map: Record<ProjectRole, string> = {
      admin: 'ADMIN',
      tester: 'TESTER',
      viewer: 'VIEWER',
    };
    return map[this.role] ?? this.role.toUpperCase();
  }
}

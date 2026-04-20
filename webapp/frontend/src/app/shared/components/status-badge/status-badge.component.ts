// src/app/shared/components/status-badge/status-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus =
  // Test case statuses
  | 'draft'
  | 'active'
  | 'deprecated';


@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'draft'; //what comes here now:

  get badgeClass(): string {
    return this.status.toLowerCase(); // Always go lowercase for CSS classes
  }

  get label(): string {
    const map: Record<BadgeStatus, string> = {
      draft: 'DRAFT',
      active: 'ACTIVE',
      deprecated: 'DEPRECATED',
    };
    return map[this.status] ?? this.status.toUpperCase();
  }
}

// src/app/shared/components/status-badge/status-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus =
// Execution statuses
  | 'pass'
  | 'fail'
  | 'blocked'
  | 'not_run'
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
  @Input() status: BadgeStatus = 'not_run';

  get badgeClass(): string {
    return this.status;
  }

  get label(): string {
    const map: Record<BadgeStatus, string> = {
      pass: 'PASS',
      fail: 'FAIL',
      blocked: 'BLOCKED',
      not_run: 'NOT RUN',
      draft: 'DRAFT',
      active: 'ACTIVE',
      deprecated: 'DEPRECATED',
    };
    return map[this.status] ?? this.status.toUpperCase();
  }
}

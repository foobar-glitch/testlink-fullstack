import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionStatus } from '../../../core/models'; // adjust import path


@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: ExecutionStatus = 'not_run';

  get badgeClass(): string { return this.status; }

  get label(): string {
    const map: Record<ExecutionStatus, string> = {
      pass: 'PASS',
      fail: 'FAIL',
      blocked: 'BLOCKED',
      not_run: 'NOT RUN',
    };
    return map[this.status];
  }

  // For other statuses (priority, test case status) you can add separate inputs
  // e.g., @Input() priority: 'high' | 'medium' | 'low';
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TestRunStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

@Component({
  selector: 'app-test-run-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-run-status-badge.component.html',
  styleUrls: ['./test-run-status-badge.component.scss'],
})
export class TestRunStatusBadgeComponent {
  @Input() status: TestRunStatus = 'NOT_RUN';

  get badgeClass(): string {
    return this.status.toLowerCase();
  }

  get label(): string {
    const map: Record<TestRunStatus, string> = {
      NOT_RUN: 'Not Run',
      PASSED: 'Passed',
      FAILED: 'Failed',
      BLOCKED: 'Blocked',
      SKIPPED: 'Skipped',
    };
    return map[this.status];
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestCasePriority } from '../../../core/models/testsuite';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-badge.component.html',
  styleUrls: ['./priority-badge.component.scss'],
})
export class PriorityBadgeComponent {
  @Input() priority: TestCasePriority = 'medium';

  get label(): string {
    return this.priority.charAt(0).toUpperCase() + this.priority.slice(1);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestCasePriority } from '../../../core/models/testsuite';

const VALID_PRIORITIES: TestCasePriority[] = ['low', 'medium', 'high'];

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-badge.component.html',
  styleUrls: ['./priority-badge.component.scss'],
})
export class PriorityBadgeComponent {
  private _priority: TestCasePriority = 'medium';

  @Input()
  set priority(value: TestCasePriority | string | undefined) {
    const normalized = value?.toLowerCase() as TestCasePriority | undefined;
    this._priority = VALID_PRIORITIES.includes(normalized!) ? normalized! : 'medium';
  }

  get priority(): TestCasePriority {
    return this._priority;
  }

  get label(): string {
    return this._priority.charAt(0).toUpperCase() + this._priority.slice(1);
  }
}

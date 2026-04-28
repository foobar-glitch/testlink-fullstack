import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestPlanRunItem, TestRunStatus } from '../../../../core/models/testexecution';
import { TestRunStatusBadgeComponent } from '../../../../shared/components/test-run-status-badge/test-run-status-badge.component';

type SortCol = 'testCase' | 'assignedTo' | 'status' | 'executedAt';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-execution-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TestRunStatusBadgeComponent],
  templateUrl: './execution-table.component.html',
  styleUrls: ['./execution-table.component.scss'],
})
export class ExecutionTableComponent implements OnChanges {
  @Input() items: TestPlanRunItem[] = [];
  @Output() itemSelected = new EventEmitter<TestPlanRunItem>();

  searchQuery = '';
  statusFilter = '';
  sortCol: SortCol = 'executedAt';
  sortDir: SortDir = 'desc';

  filtered: TestPlanRunItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let result = [...this.items];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.testCaseVersion.testCase?.title?.toLowerCase().includes(q) ||
          i.assignedTo?.username?.toLowerCase().includes(q),
      );
    }

    if (this.statusFilter) {
      result = result.filter((i) => i.status === this.statusFilter);
    }

    this.filtered = this.sortRows(result);
  }

  sort(col: SortCol): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.filtered = this.sortRows(this.filtered);
  }

  getSortIcon(col: SortCol): string {
    if (this.sortCol !== col) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  getIdentifier(item: TestPlanRunItem): string {
    const tc = item.testCaseVersion?.testCase;
    if (!tc) return '';
    return `${tc.testSuite?.project?.projectKey ?? ''}-${tc.identifierNumber}`;
  }

  private sortRows(rows: TestPlanRunItem[]): TestPlanRunItem[] {
    return [...rows].sort((a, b) => {
      let av = '';
      let bv = '';
      switch (this.sortCol) {
        case 'testCase':
          av = a.testCaseVersion.testCase?.title ?? '';
          bv = b.testCaseVersion.testCase?.title ?? '';
          break;
        case 'assignedTo':
          av = a.assignedTo?.username ?? '';
          bv = b.assignedTo?.username ?? '';
          break;
        case 'status':
          av = a.status;
          bv = b.status;
          break;
        case 'executedAt':
          av = a.executedAt ?? '';
          bv = b.executedAt ?? '';
          break;
      }
      const cmp = av.localeCompare(bv);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }
}

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestCase } from '../../../core/models/testsuite';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type SortCol = 'id' | 'title' | 'status' | 'priority';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-case-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TitleCasePipe, StatusBadgeComponent],
  templateUrl: './case-table.component.html',
  styleUrls: ['./case-table.component.scss'],
})
export class CaseTableComponent implements OnChanges {
  @Input() cases: TestCase[] = [];
  @Output() caseSelected = new EventEmitter<TestCase>();

  searchQuery  = '';
  statusFilter = '';
  sortCol: SortCol = 'id';
  sortDir: SortDir = 'asc';

  filtered: TestCase[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cases']) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let result = [...this.cases];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(tc =>
        tc.title.toLowerCase().includes(q) ||
        String(tc.identifierNumber).includes(q),
      );
    }

    if (this.statusFilter) {
      result = result.filter(tc => tc.status === this.statusFilter);
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

  private sortRows(rows: TestCase[]): TestCase[] {
    return [...rows].sort((a, b) => {
      let av = '';
      let bv = '';
      switch (this.sortCol) {
        case 'id':
          return this.sortDir === 'asc'
            ? a.identifierNumber - b.identifierNumber
            : b.identifierNumber - a.identifierNumber;
        case 'title':
          av = a.title; bv = b.title; break;
        case 'status':
          av = a.status; bv = b.status; break;
        case 'priority':
          av = a.priority ?? ''; bv = b.priority ?? ''; break;
      }
      const cmp = av.localeCompare(bv);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }
}

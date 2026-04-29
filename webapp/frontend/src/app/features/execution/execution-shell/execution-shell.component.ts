import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExecutionSidebarComponent } from './execution-sidebar/execution-sidebar.component';

@Component({
  selector: 'app-explorer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ExecutionSidebarComponent],
  templateUrl: './execution-shell.component.html',
  styleUrls: ['./execution-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionShellComponent {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

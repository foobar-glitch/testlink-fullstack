import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExecutionSidebarComponent } from './execution-sidebar/execution-sidebar.component';

@Component({
  selector: 'app-explorer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ExecutionSidebarComponent],
  templateUrl: './execution-layout.component.html',
  styleUrls: ['./execution-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionLayoutComponent {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

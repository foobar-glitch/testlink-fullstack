// dashboard-sidebar.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestCase, TestSuite } from '../../../core/models/testsuite';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent {
  @Input() suiteTree: TestSuite[] | null = [];
  @Input() selectedProjectKey: string | null = null;
  @Output() nodeSelected = new EventEmitter<TestSuite | TestCase>();

  expandedNodes = new Set<string>();

  toggleNode(node: TestSuite, event: Event): void {
    event.stopPropagation();
    node.expanded = !node.expanded;
  }

  selectNode(node: TestSuite | TestCase): void {
    this.nodeSelected.emit(node);
  }

  isExpanded(node: TestSuite): boolean {
    return node.expanded;
  }

  hasChildren(node: TestSuite): boolean {
    return node.children && node.children.length > 0;
  }

  expandAll(): void {
    this.setExpandedRecursive(this.suiteTree || [], true);
  }

  collapseAll(): void {
    this.setExpandedRecursive(this.suiteTree || [], false);
  }

  private setExpandedRecursive(nodes: TestSuite[], expanded: boolean): void {
    nodes.forEach(node => {
      node.expanded = expanded;
      if (node.children && node.children.length) {
        this.setExpandedRecursive(node.children, expanded);
      }
    });
  }
}

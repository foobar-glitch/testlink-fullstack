import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { TestSuite, TestCase } from '../../../core/models/testsuite';
import { TestPlan } from '../../../core/models/testexecution';
import { TestPlanService } from '../../../core/services/test-plan.service';
import { TestPlanOverviewComponent } from './test-plan-overview/test-plan-overview.component';
import { TestCaseListComponent } from '../../test-cases/test-case-list/test-case-list.component';
import { TestCaseDetailComponent } from '../../test-cases/test-case-detail/test-case-detail.component';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [
    CommonModule,
    TestPlanOverviewComponent,
    TestCaseListComponent,
    TestCaseDetailComponent
  ],
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss']
})
export class DashboardContentComponent implements OnChanges {
  @Input() selectedProjectKey: string | null = null;
  @Input() selectedTestPlanId: string | null = null;
  @Input() selectedNode: TestSuite | TestCase | null = null;

  private testPlanService = inject(TestPlanService);

  currentView: 'plan' | 'suite' | 'case' = 'plan';
  selectedPlan$: Observable<TestPlan | null> = of(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTestPlanId'] && this.selectedTestPlanId && this.selectedProjectKey) {
      this.selectedPlan$ = this.testPlanService.getTestPlan(this.selectedProjectKey, this.selectedTestPlanId);
    }

    if (this.selectedNode) {
      this.currentView = this.isTestSuite(this.selectedNode) ? 'suite' : 'case';
    } else if (this.selectedTestPlanId) {
      this.currentView = 'plan';
    }
  }

  private isTestSuite(node: TestSuite | TestCase): node is TestSuite {
    return (node as TestSuite).children !== undefined;
  }

  asTestSuite(node: TestSuite | TestCase): TestSuite {
    return node as TestSuite;
  }

  asTestCase(node: TestSuite | TestCase): TestCase {
    return node as TestCase;
  }
}

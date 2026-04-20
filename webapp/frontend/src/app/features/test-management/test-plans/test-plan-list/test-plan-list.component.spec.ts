import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanListComponent } from './test-plan-list.component';

describe('TestPlanListComponent', () => {
  let component: TestPlanListComponent;
  let fixture: ComponentFixture<TestPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestPlanListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

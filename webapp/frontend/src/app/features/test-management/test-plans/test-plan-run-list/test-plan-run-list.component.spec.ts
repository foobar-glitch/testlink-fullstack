import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanRunListComponent } from './test-plan-run-list.component';

describe('TestPlanRunListComponent', () => {
  let component: TestPlanRunListComponent;
  let fixture: ComponentFixture<TestPlanRunListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanRunListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestPlanRunListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

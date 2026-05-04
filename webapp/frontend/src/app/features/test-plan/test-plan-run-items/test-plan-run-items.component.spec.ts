import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanRunItemsComponent } from './test-plan-run-items.component';

describe('TestPlanRunItemsComponent', () => {
  let component: TestPlanRunItemsComponent;
  let fixture: ComponentFixture<TestPlanRunItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanRunItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestPlanRunItemsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

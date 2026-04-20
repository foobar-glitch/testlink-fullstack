import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanRunItemDetailComponent } from './test-plan-run-item-detail.component';

describe('TestPlanRunItemDetailComponent', () => {
  let component: TestPlanRunItemDetailComponent;
  let fixture: ComponentFixture<TestPlanRunItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanRunItemDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestPlanRunItemDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

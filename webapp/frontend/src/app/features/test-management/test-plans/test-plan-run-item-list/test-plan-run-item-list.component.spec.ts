import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanRunItemListComponent } from './test-plan-run-item-list.component';

describe('TestPlanRunItemListComponent', () => {
  let component: TestPlanRunItemListComponent;
  let fixture: ComponentFixture<TestPlanRunItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlanRunItemListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestPlanRunItemListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

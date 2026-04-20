import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStepResultDetailComponent } from './test-step-result-detail.component';

describe('TestStepResultDetailComponent', () => {
  let component: TestStepResultDetailComponent;
  let fixture: ComponentFixture<TestStepResultDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStepResultDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestStepResultDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

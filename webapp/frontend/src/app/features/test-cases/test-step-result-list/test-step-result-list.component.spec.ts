import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStepResultListComponent } from './test-step-result-list.component';

describe('TestStepResultListComponent', () => {
  let component: TestStepResultListComponent;
  let fixture: ComponentFixture<TestStepResultListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStepResultListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestStepResultListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

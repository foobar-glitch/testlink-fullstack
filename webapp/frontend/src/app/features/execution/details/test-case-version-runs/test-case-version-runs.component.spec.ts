import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseVersionRunsComponent } from './test-case-version-runs.component';

describe('TestCaseVersionRunsComponent', () => {
  let component: TestCaseVersionRunsComponent;
  let fixture: ComponentFixture<TestCaseVersionRunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseVersionRunsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCaseVersionRunsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

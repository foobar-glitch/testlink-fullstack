import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRunStatusBadgeComponent } from './test-run-status-badge.component';

describe('TestRunStatusBadgeComponent', () => {
  let component: TestRunStatusBadgeComponent;
  let fixture: ComponentFixture<TestRunStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRunStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestRunStatusBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

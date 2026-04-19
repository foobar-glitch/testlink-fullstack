import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseVersionContentComponent } from './test-case-version-content.component';

describe('TestCaseVersionContentComponent', () => {
  let component: TestCaseVersionContentComponent;
  let fixture: ComponentFixture<TestCaseVersionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseVersionContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCaseVersionContentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

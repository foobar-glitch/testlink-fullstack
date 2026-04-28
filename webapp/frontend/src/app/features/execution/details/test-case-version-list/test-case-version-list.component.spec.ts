import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseVersionListComponent } from './test-case-version-list.component';

describe('TestCaseVersionListComponent', () => {
  let component: TestCaseVersionListComponent;
  let fixture: ComponentFixture<TestCaseVersionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseVersionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCaseVersionListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

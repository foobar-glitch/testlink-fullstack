import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseListComponent } from './test-case-list.component';

describe('TestCaseList', () => {
  let component: TestCaseListComponent;
  let fixture: ComponentFixture<TestCaseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCaseListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecSuiteTreeNodeComponent } from './spec-suite-tree-node.component';

describe('SpecSuiteTreeNodeComponent', () => {
  let component: SpecSuiteTreeNodeComponent;
  let fixture: ComponentFixture<SpecSuiteTreeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecSuiteTreeNodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecSuiteTreeNodeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

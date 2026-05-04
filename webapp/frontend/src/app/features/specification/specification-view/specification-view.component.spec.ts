import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificationViewComponent } from './specification-view.component';

describe('SpecificationViewComponent', () => {
  let component: SpecificationViewComponent;
  let fixture: ComponentFixture<SpecificationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificationViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecificationViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

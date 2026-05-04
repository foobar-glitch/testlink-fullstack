import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificationShellComponent } from './specification-shell.component';

describe('SpecificationShellComponent', () => {
  let component: SpecificationShellComponent;
  let fixture: ComponentFixture<SpecificationShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificationShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecificationShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

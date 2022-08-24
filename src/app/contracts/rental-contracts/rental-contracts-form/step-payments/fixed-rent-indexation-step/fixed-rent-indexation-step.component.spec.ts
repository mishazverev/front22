import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedRentIndexationStepComponent } from './fixed-rent-indexation-step.component';

describe('FixedRentIndexationStepComponent', () => {
  let component: FixedRentIndexationStepComponent;
  let fixture: ComponentFixture<FixedRentIndexationStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedRentIndexationStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedRentIndexationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

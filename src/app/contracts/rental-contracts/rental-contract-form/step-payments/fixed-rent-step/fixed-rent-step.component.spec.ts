import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedRentStepComponent } from './fixed-rent-step.component';

describe('FixedRentStepComponent', () => {
  let component: FixedRentStepComponent;
  let fixture: ComponentFixture<FixedRentStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedRentStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedRentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

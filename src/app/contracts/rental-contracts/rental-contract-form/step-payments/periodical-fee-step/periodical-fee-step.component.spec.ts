import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicalFeeStepComponent } from './periodical-fee-step.component';

describe('PeriodicalFeeStepComponent', () => {
  let component: PeriodicalFeeStepComponent;
  let fixture: ComponentFixture<PeriodicalFeeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodicalFeeStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicalFeeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

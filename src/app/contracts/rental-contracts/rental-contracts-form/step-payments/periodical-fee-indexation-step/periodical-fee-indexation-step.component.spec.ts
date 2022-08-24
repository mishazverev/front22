import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicalFeeIndexationStepComponent } from './periodical-fee-indexation-step.component';

describe('PeriodicalFeeIndexationStepComponent', () => {
  let component: PeriodicalFeeIndexationStepComponent;
  let fixture: ComponentFixture<PeriodicalFeeIndexationStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeriodicalFeeIndexationStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicalFeeIndexationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

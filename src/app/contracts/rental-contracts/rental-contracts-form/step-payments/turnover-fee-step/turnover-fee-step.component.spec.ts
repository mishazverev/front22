import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoverFeeStepComponent } from './turnover-fee-step.component';

describe('TurnoverFeeStepComponent', () => {
  let component: TurnoverFeeStepComponent;
  let fixture: ComponentFixture<TurnoverFeeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurnoverFeeStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnoverFeeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

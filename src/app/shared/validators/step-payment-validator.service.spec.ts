import { TestBed } from '@angular/core/testing';

import { StepPaymentValidatorService } from './step-payment-validator.service';

describe('StepPaymentValidatorService', () => {
  let service: StepPaymentValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepPaymentValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

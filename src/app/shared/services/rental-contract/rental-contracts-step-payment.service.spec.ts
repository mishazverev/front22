import { TestBed } from '@angular/core/testing';

import { RentalContractStepPaymentService } from './rental-contract-step-payment.service';

describe('StepPaymentService', () => {
  let service: RentalContractStepPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractStepPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { StepPaymentService } from './step-payment.service';

describe('StepPaymentService', () => {
  let service: StepPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

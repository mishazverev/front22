import { TestBed } from '@angular/core/testing';

import { RentalContractFixedRentStepService } from './rental-contract-fixed-rent-step.service';

describe('RentalContractFixedRentStepService', () => {
  let service: RentalContractFixedRentStepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractFixedRentStepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

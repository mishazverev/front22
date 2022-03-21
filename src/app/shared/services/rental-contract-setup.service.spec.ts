import { TestBed } from '@angular/core/testing';

import { RentalContractSetupService } from './rental-contract-setup.service';

describe('RentalContractSetupService', () => {
  let service: RentalContractSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

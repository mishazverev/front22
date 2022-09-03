import { TestBed } from '@angular/core/testing';

import { RentalContractFeesService } from './rental-contract-fees.service';

describe('RentalContractFeesService', () => {
  let service: RentalContractFeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractFeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { RentalContractAdditionalAgreementService } from './rental-contract-additional-agreement.service';

describe('RentalContractAdditionalAgreementService', () => {
  let service: RentalContractAdditionalAgreementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractAdditionalAgreementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

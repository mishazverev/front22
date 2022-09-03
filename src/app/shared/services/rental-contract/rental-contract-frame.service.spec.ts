import { TestBed } from '@angular/core/testing';

import { RentalContractFrameService } from './rental-contract-frame.service';

describe('RentalContractFrameService', () => {
  let service: RentalContractFrameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalContractFrameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { GlobalAppService } from './global-app.service';

describe('GlobalAppService', () => {
  let service: GlobalAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractAdditionalAgreementComponent } from './rental-contract-additional-agreement.component';

describe('RentalContractAdditionalAgreementComponent', () => {
  let component: RentalContractAdditionalAgreementComponent;
  let fixture: ComponentFixture<RentalContractAdditionalAgreementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractAdditionalAgreementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractAdditionalAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

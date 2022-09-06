import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractsFormSetupComponent } from './rental-contracts-form-setup.component';

describe('RentalContractsFormSetupComponent', () => {
  let component: RentalContractsFormSetupComponent;
  let fixture: ComponentFixture<RentalContractsFormSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractsFormSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractsFormSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

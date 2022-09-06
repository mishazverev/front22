import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractFormComponent } from './rental-contract-form.component';

describe('RentalContractsFormComponent', () => {
  let component: RentalContractFormComponent;
  let fixture: ComponentFixture<RentalContractFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

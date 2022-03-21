import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractsSetupComponent } from './rental-contracts-setup.component';

describe('RentalContractsSetupComponent', () => {
  let component: RentalContractsSetupComponent;
  let fixture: ComponentFixture<RentalContractsSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractsSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

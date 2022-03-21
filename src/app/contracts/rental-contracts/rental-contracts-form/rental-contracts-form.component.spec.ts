import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractsFormComponent } from './rental-contracts-form.component';

describe('RentalContractsFormComponent', () => {
  let component: RentalContractsFormComponent;
  let fixture: ComponentFixture<RentalContractsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractsListComponent } from './rental-contracts-list.component';

describe('RentalContractsListComponent', () => {
  let component: RentalContractsListComponent;
  let fixture: ComponentFixture<RentalContractsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

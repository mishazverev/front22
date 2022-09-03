import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalContractFrameComponent } from './rental-contract-frame.component';

describe('RentalContractsFrameComponent', () => {
  let component: RentalContractFrameComponent;
  let fixture: ComponentFixture<RentalContractFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RentalContractFrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

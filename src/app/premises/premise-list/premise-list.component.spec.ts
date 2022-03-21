import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiseListComponent } from './premise-list.component';

describe('PremiseListComponent', () => {
  let component: PremiseListComponent;
  let fixture: ComponentFixture<PremiseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremiseListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

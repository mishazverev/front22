import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiseFormComponent } from './premise-form.component';

describe('PremiseFormComponent', () => {
  let component: PremiseFormComponent;
  let fixture: ComponentFixture<PremiseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremiseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

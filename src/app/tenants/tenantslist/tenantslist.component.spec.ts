import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantslistComponent } from './tenantslist.component';

describe('TenantslistComponent', () => {
  let component: TenantslistComponent;
  let fixture: ComponentFixture<TenantslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

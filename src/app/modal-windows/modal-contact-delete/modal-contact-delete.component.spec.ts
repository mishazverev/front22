import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContactDeleteComponent } from './modal-contact-delete.component';

describe('ModalContactDeleteComponent', () => {
  let component: ModalContactDeleteComponent;
  let fixture: ComponentFixture<ModalContactDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalContactDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalContactDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

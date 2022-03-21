import { Component, OnInit } from '@angular/core';
import {TenantService} from "../../shared/services/tenant.service";
import {MatDialogRef} from "@angular/material/dialog";
import {ApiService} from "../../shared/services/api.service";

@Component({
  selector: 'app-modal-contact-delete',
  templateUrl: './modal-contact-delete.component.html',
  styleUrls: ['./modal-contact-delete.component.sass']
})
export class ModalContactDeleteComponent implements OnInit {

  constructor(
    public service: TenantService,
     public modalContactDeleteDialogRef: MatDialogRef<ModalContactDeleteComponent>,
    private apiService: ApiService

) { }

  ngOnInit(): void {
  }

  confirmedDeleteContact(){
    if(this.service.deletedContactId) {
      this.apiService.deleteTenantContact(this.service.deletedContactId).subscribe(
        () => console.log('Contact deletion is confirmed')
      )
    }
    this.service.contactTabs.removeAt(this.service.deletedContactIndex)
    this.service.contact_name.splice(this.service.deletedContactIndex, 1)
    this.service.activeTab$.next(0)
    console.log(this.service.activeTab$.value)
    this.service.deletedContactId = -1
    this.service.deletedContactIndex = -1
    this.service.deletedContactName = ''
    this.modalContactDeleteDialogRef.close()
  }

  rejectDeleteContact(){
    this.service.deletedContactId = -1
    this.service.deletedContactIndex = -1
    this.service.deletedContactName = ''
    this.modalContactDeleteDialogRef.close()
    console.log('Contact deletion is rejected')
  }
}

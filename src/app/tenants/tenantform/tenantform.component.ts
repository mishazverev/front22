import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {TenantService} from "../../shared/services/tenant.service";
import {ApiService} from "../../shared/services/api.service";
import {DatePipe} from "@angular/common";
import {MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../shared/notification.service";
import {TenantModel} from "../../models/models";
import {ENTER} from "@angular/cdk/keycodes";
import {GlobalAppService} from "../../shared/services/global-app.service";

@Component({
  selector: 'app-tenantform',
  templateUrl: './tenantform.component.html',
  styleUrls: ['./tenantform.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class TenantformComponent implements OnInit, OnDestroy {
  selected = 'Торговое помещение' //Default needed_premise_type value
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER];
  constructor(
    public service: TenantService,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<TenantformComponent>,
    private notificationService: NotificationService,
) {}

    public contactsSubscription$: Subscription = new Subscription()

  ngOnInit() {
    // Subscribe to changes of contacts form - if contact name is not blank, let User create a new contact Tab
    this.contactsSubscription$ = this.service.contactTabs.valueChanges.subscribe(
      contacts => {
        console.log('Value changed')
        for (let contactIndex in contacts) {
          if (contacts[contactIndex].contact_person_name) {
            // @ts-ignore
            this.service.contact_name[contactIndex] = contacts[contactIndex].contact_person_name
            this.service.newContactTabTrigger$.next(true)
          } else {
            // @ts-ignore
            this.service.contact_name[contactIndex] = 'Новый контакт'
            this.service.newContactTabTrigger$.next(false)
          }
        }
      })

    // Get all brands database
    this.apiService.getBrands().subscribe(data => {
      // @ts-ignore
      this.service.brandsDatabaseArray = data
      console.log('Brand database is fetched')
    })

    //Behaviour of edit card toggle
    this.globalService.editCardTrigger$.subscribe(
      trigger => {
        if (trigger) {
          this.service.form_tenants.enable()
          this.service.brandsForm.enable()
          this.service.contactTabs.enable()
          this.service.contactTabsForm.controls['contactsArray'].enable()
          this.service.brandTabsForm.controls['brandTabsArray'].enable()
          this.service.brandTabs.enable()
          console.log('Tenant card editing is enabled')
        } else {
          this.service.contactTabsForm.disable()
          this.service.form_tenants.disable()
          this.service.brandsForm.disable()
          this.service.contactTabs.disable()
          this.service.contactTabsForm.controls['contactsArray'].disable()
          this.service.brandTabsForm.controls['brandTabsArray'].disable()
          this.service.brandTabs.disable()
          console.log('Tenant card editing is disabled')
        }
      }
    )
  }
  //Tenant card Submitting
  onSubmit() {
    //Joining form data into objects
    const tenantData: TenantModel =
      {
        ...this.service.form_tenants.value,
      }
    const contactData = this.service.contactTabs.value
    const brandsData = this.service.brandTabs.value
    tenantData.last_updated = new Date()
    console.log('Tenant card data is joined')

    //Observable, gathering data from brand tabs an putting it ids into tenant.brands_id array
    const brandIDs$ = new Observable<[number]>(
      subscriber => {
        tenantData.brands_id.splice(0, tenantData.brands_id.length)
        for (let brand of brandsData) {
          //Check if brand has an id already
          if (brand.id)
            {tenantData.brands_id.push(brand.id)
              this.apiService.updateBrand(brand.id, brand).subscribe(
                () => console.log('Brand is updated')
              )
              //Complete an observable if cycle is over
              if (tenantData.brands_id.length === brandsData.length) {
                subscriber.next(tenantData.brands_id)
                subscriber.complete()
              }
            } else {
            let n = 0
            //Check if brand has no id but brand name  is already in brand database (to do - make it via server request)
            for (let brandDBRecord of this.service.brandsDatabaseArray) {
              if (brand.brand_name === brandDBRecord.brand_name) {
                n = n + 1
                console.log('Brand already exists')
                tenantData.brands_id.push(brandDBRecord.id)
                //Complete an observable if cycle is over
                if (tenantData.brands_id.length === brandsData.length) {
                  subscriber.next(tenantData.brands_id)
                  subscriber.complete()
                }
              }
            }
            if (n === 0) {
              //Brand has no id and brand name is not in brand database (to do - make it via server request)
              this.apiService.createBrand(brand).subscribe(data => {
                console.log('Brand is created')
                // @ts-ignore
                tenantData.brands_id.push(data.id)
                //Complete an observable if cycle is over
                if (tenantData.brands_id.length === brandsData.length) {
                  subscriber.next(tenantData.brands_id)
                  subscriber.complete()
                }
              })
            }
          }
        }
      }
    )
    //Subscribe an observable and create or update Tenant
    brandIDs$.subscribe((ids) => {
      if (tenantData.id) {
        this.apiService.updateTenant(tenantData.id, tenantData)
          .subscribe(data => {
            //Update or create contacts
            for (let contact of contactData) {
              // @ts-ignore
              contact.tenant_contractor_id = data.id
              if (!contact.id) {
                this.apiService.createTenantContact(contact).subscribe(() => console.log('New contact is created'))
              } else {
                this.apiService.updateTenantContact(contact.id, contact).subscribe(() => console.log('Contact is updated'))
              }
            }
            // @ts-ignore
            this.service.updateTableRow(data, brandsData)
            this.notificationService.success('Профиль арендатора успешно обновлён');
          })
      } else {
        this.apiService.createTenant(tenantData)
          .subscribe(data => {
            for (let contact of contactData) {
              // @ts-ignore
              contact.tenant_contractor_id = data.id
              this.apiService.createTenantContact(contact).subscribe(() => console.log('New contact is created'))
            }
            // @ts-ignore
            this.service.newTableRow(data, brandsData)
            this.notificationService.success('Профиль арендатора успешно добавлен');
          })
      }})

    this.service.form_tenants.reset()
    this.service.contactTabsForm.reset()

    this.service.brandsDatabaseArray = []
    this.dialogRef.close()
  }
  //Tenant card closing
  onClose() {
    this.service.form_tenants.reset();
    this.service.brandsArray = []
    this.dialogRef.close()
  }

  ngOnDestroy(){
    this.contactsSubscription$.unsubscribe()
  }
}

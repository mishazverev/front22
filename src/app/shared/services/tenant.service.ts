import {Injectable} from "@angular/core";
import {FormControl, Validators, FormBuilder, FormArray, FormGroup} from "@angular/forms";
import {
  TenantModel,
  TenantContactsModelApi,
  BrandModel,
  TenantExtendedModel
} from "../../models/models";
import {BehaviorSubject} from "rxjs";
import {ApiService} from "./api.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ModalContactDeleteComponent} from "../../modal-windows/modal-contact-delete/modal-contact-delete.component";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {MatChipInputEvent} from "@angular/material/chips";
import {GlobalAppService} from "./global-app.service";

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  // @ts-ignore //Observable containing last created row
  private rowCreate$ = new BehaviorSubject<TenantExtendedModel>([])
  newRow$ = this.rowCreate$.asObservable()
  // @ts-ignore //Observable containing last updated row
  private rowUpdate$ = new BehaviorSubject<TenantExtendedModel>([])
  updateRow$ = this.rowUpdate$.asObservable()
  //Trigger toggle editing Tenant card
  public editCardTrigger$ = new BehaviorSubject<boolean>(false)
  //Active contact tab number
  public activeTab$ = new BehaviorSubject<number>(0)
  public newContactTabTrigger$ = new BehaviorSubject<boolean>(false)
  public tenantFormIsLoaded$ = new BehaviorSubject<boolean>(false)


  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public modalContactDeleteDialog: MatDialog,
  ){}

  //Variables for deleting contacts function (modal-window-delete.component)
  public deletedContactId: number = -1
  public deletedContactIndex: number = -1
  public deletedContactName: string = ''

  public brandsArray: BrandModel[] = [] //BrandModel array
  public brandsDatabaseArray: BrandModel[] = [] // Full fetched brands database array
  public contact_name: string[] = [] //Array of contact names for contact Tabs labeling

  //Reactive Forms declaring
  form_tenants = this.fb.group({
    id: [''],
    company_name: ['', Validators.required],
    needed_premise_type: ['', Validators.required],
    brands_id: [''],
    description: [''],

    needed_min_area: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_max_area: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_ceiling_height: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_fitout_condition: [false],
    needed_electric_capacity:  ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_cooling_capacity:  ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_water_supply: [false],
    needed_additional_requirements: [''],

    legal_name:[''],
    tax_id:  ['',Validators.pattern("^[0-9]{10}$|^[0-9]{12}$")],
    signing_person_name:[''],
    signing_person_position:[''],
    legal_address: [''],
    postal_address: [''],
    kpp: ['',Validators.pattern("^[0-9]{9}")],
    bik: ['',Validators.pattern("^[0-9]{9}")],
    bank_name:  [''],
    current_account: ['',Validators.pattern("^[0-9]{20}")],
    correspondent_account: ['',Validators.pattern("^[0-9]{20}")],
    ogrn: ['',Validators.pattern("^[0-9]{13}")],
    okpo: ['',Validators.pattern("^[0-9]{8}$|^[0-9]{10}$")],
    registration_authority:[''],
    legal_entity_certificate_number:['',Validators.pattern("^[0-9]{1,20}")],
    last_updated: [''],
    user_updated:  [''],
  })
  contactTabsForm = this.fb.group({
    contactsArray: this.fb.array([
    ])
  })
  brandTabsForm = this.fb.group({
    brandTabsArray: this.fb.array([
    ])
  })
  brandsForm = this.fb.group({
    id: [''],
    brand_name: [''],
    brand_description: [''],
    brand_category_tag: [[]],

    retail_premise_type: [],
    needed_min_area: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_max_area: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_ceiling_height: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_facade_length: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_fitout_condition: [false],
    needed_electric_capacity:  ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_cooling_capacity:  ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    needed_water_supply: [false],
    needed_additional_requirements: ['']
  })
  contactTabs: FormArray = this.contactTabsForm.get('contactsArray') as FormArray //Array of contact Tabs
  brandTabs: FormArray = this.brandTabsForm.get('brandTabsArray') as FormArray //Array of brand Tabs

  // Initialize new Tenant card, onCreate in tenantslist.component
  initializeNewTenantCard(){
    this.form_tenants.setValue({
      id: '',
      company_name: '',
      needed_premise_type: 'retail_premise',
      brands_id: [],
      description: '',
      needed_min_area: '',
      needed_max_area: '',
      needed_ceiling_height: '',
      needed_fitout_condition: false,
      needed_electric_capacity: '',
      needed_cooling_capacity: '',
      needed_water_supply: false,
      needed_additional_requirements: '',
      legal_name:  '',
      tax_id:  null,
      signing_person_name:  '',
      signing_person_position:  '',
      legal_address:  '',
      postal_address:  '',
      kpp:  null,
      bik:  null,
      bank_name:  '',
      current_account:  '',
      correspondent_account:  '',
      ogrn:  '',
      okpo:  '',
      registration_authority: '',
      legal_entity_certificate_number: '',

      last_updated:  '',
      user_updated:  '',
    })
    this.contactTabsForm.setControl('contactsArray', this.addContactsTab())
    this.brandsForm.setValue({
      id: '',
      brand_name: '',
      brand_description: '',
      brand_category_tag: [],

      retail_premise_type: '',
      needed_min_area: '',
      needed_max_area: '',
      needed_ceiling_height: '',
      needed_facade_length: '',
      needed_fitout_condition: false,
      needed_electric_capacity: '',
      needed_cooling_capacity: '',
      needed_water_supply: false,
      needed_additional_requirements: '',
    })
    this.brandsArray = []
    this.brandTabs.clear()
    console.log('Tenant card is initialized')
  }

  // Populate edited Tenant card, onEdit in tenantslist.component
  populateTenantCard(data: TenantExtendedModel) {
    this.newContactTabTrigger$.next(false)
    this.form_tenants.setValue({
      id: data.id,
      company_name: data.company_name,
      needed_premise_type: data.needed_premise_type,
      brands_id: data.brands_id,
      description: data.description,
      needed_min_area: data.needed_min_area,
      needed_max_area: data.needed_max_area,
      needed_ceiling_height: data.needed_ceiling_height,
      needed_fitout_condition: data.needed_fitout_condition,
      needed_electric_capacity: data.needed_electric_capacity,
      needed_cooling_capacity: data.needed_cooling_capacity,
      needed_water_supply: data.needed_water_supply,
      needed_additional_requirements: data.needed_additional_requirements,
      legal_name: data.legal_name,
      tax_id: data.tax_id,
      signing_person_name: data.signing_person_name,
      signing_person_position: data.signing_person_position,
      legal_address: data.legal_address,
      postal_address: data.postal_address,
      kpp: data.kpp,
      bik: data.bik,
      bank_name: data.bank_name,
      current_account: data.current_account,
      correspondent_account: data.correspondent_account,
      ogrn: data.ogrn,
      okpo: data.okpo,
      registration_authority: data.registration_authority,
      legal_entity_certificate_number: data.legal_entity_certificate_number,
      last_updated: data.last_updated,
      user_updated: data.user_updated,
    })
    this.brandsArray = []
    this.brandTabs.clear()
    this.brandsForm.setValue({
      id: '',
      brand_name: '',
      brand_description: '',
      brand_category_tag: [],

      retail_premise_type: '',
      needed_min_area: '',
      needed_max_area: '',
      needed_ceiling_height: '',
      needed_facade_length: '',
      needed_fitout_condition: '',
      needed_electric_capacity: '',
      needed_cooling_capacity: '',
      needed_water_supply: '',
      needed_additional_requirements: ''

    })
    this.apiService.getTenantContact(data.id).subscribe(
        data => {
          this.contactTabsForm.setControl('contactsArray', this.setExistingContacts(data))
          this.newContactTabTrigger$.next(true)
        })
    for (let brand_id of data.brands_id){
      this.apiService.getBrand(brand_id)
        .subscribe(
        brand => {
          // @ts-ignore
          this.brandsArray.push(brand)
          if(data.brands_id.length === this.brandsArray.length)
          {
            this.brandTabsForm.setControl('brandTabsArray', this.setExistingBrands(this.brandsArray))
            this.tenantFormIsLoaded$.next(true)
            this.activeTab$.next (0)
            console.log('Tenant card is populated with existing brands')
          }
        }
      )
    }
  }

  // Populate edited Tenant card with existing Contacts
  setExistingContacts(contactsArray: TenantContactsModelApi[]): FormArray{
      contactsArray = contactsArray.sort(this.arraySorting('contact_person_name'))
      contactsArray.forEach( contact =>{
        this.contactTabs.push(this.fb.group({
          id: new FormControl(contact.id),
          tenant_contractor_id: new FormControl(contact.tenant_contractor_id),
          contact_person_name: new FormControl(contact.contact_person_name),
          contact_person_position: new FormControl(contact.contact_person_position),
          contact_person_email: new FormControl(contact.contact_person_email, Validators.email),
          contact_person_phone: new FormControl(contact.contact_person_phone, Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')),
          contact_person_mobile1: new FormControl(contact.contact_person_mobile1, Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')),
          contact_person_mobile2: new FormControl(contact.contact_person_mobile2, Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$'))
        }))})
    console.log('Tenant card is populated with existing Contacts')
    return this.contactTabs
  }

  // Add new Contact Tab
  addContactsTab() {
    this.contactTabs.push(new FormGroup({
      id: new FormControl(''),
      tenant_contractor_id: new FormControl(''),
      contact_person_name: new FormControl(''),
      contact_person_position: new FormControl(''),
      contact_person_email: new FormControl('', Validators.email),
      contact_person_phone: new FormControl('', Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')),
      contact_person_mobile1: new FormControl('', Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')),
      contact_person_mobile2: new FormControl('', Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')),
    }))
    this.newContactTabTrigger$.next(false)
    this.activeTab$.next (this.contact_name.length + 1)
    console.log('New Contact tab is added')
    return this.contactTabs
  }

  // Delete Contact
  deleteContact(index: number, id:number, contact_name: string) {
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true
    dialogConfig.autoFocus = true
    this.deletedContactId = id
    this.deletedContactIndex = index
    this.deletedContactName = contact_name
    this.modalContactDeleteDialog.open(ModalContactDeleteComponent, dialogConfig)
    console.log('Contact is deleted')

  }

  // Populate edited Tenant card with existing Brands
  setExistingBrands(brandsArray: BrandModel[]): FormArray{
    this.brandsArray = this.brandsArray.sort(this.arraySorting('brand_name'))
    for (let brand of brandsArray) {
      this.brandTabs.push(this.fb.group({
        id: new FormControl(brand.id),
        brand_name: new FormControl(brand.brand_name),
        brand_description: new FormControl(brand.brand_description),
        brand_category_tag: new FormControl(brand.brand_category_tag),
        retail_premise_type: new FormControl(brand.retail_premise_type),
        needed_min_area: new FormControl(brand.needed_min_area, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_max_area: new FormControl(brand.needed_max_area, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_ceiling_height: new FormControl(brand.needed_ceiling_height, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_facade_length: new FormControl(brand.needed_facade_length, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_fitout_condition: new FormControl(brand.needed_fitout_condition),
        needed_electric_capacity: new FormControl(brand.needed_electric_capacity, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_cooling_capacity: new FormControl(brand.needed_cooling_capacity, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_water_supply: new FormControl(brand.needed_water_supply),
        needed_additional_requirements: new FormControl(brand.needed_additional_requirements),
      }))
    }
    console.log('Existing Brand tabs is populated')
    return this.brandTabs
  }

  //Add new Brand
  addBrandChip(event: MatChipInputEvent) {
    const brandName: string = (event.value || '').trim();
    const brandObject = {} as BrandModel
    // Add our brand
    let i = 0
    for (let brand of this.brandsArray){
      if (brandName === brand.brand_name){
        i = 1
      }
    }
    if (brandName && i === 0) {
      brandObject.brand_name = brandName
      this.brandsArray.push(brandObject)
      this.setNewBrandTab(brandObject.brand_name)
      console.log('New Brand is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  //Remove Brand
  removeBrandChip(brand: BrandModel): void {
    const index = this.brandsArray.indexOf(brand);
    if (index >= 0) {
      this.brandsArray.splice(index, 1);
      this.brandTabs.removeAt(index)
      console.log('Brand is removed')
    }
  }

  // Initialize new Brand Tab
  setNewBrandTab(brand_name:string) {
    this.brandTabs.push(
      this.fb.group({
        id: new FormControl(''),
        brand_name: new FormControl(brand_name),
        brand_category_tag: new FormControl([]),
        brand_description: new FormControl(''),
        retail_premise_type: new FormControl(''),
        needed_min_area: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_max_area: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_ceiling_height: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_facade_length: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_fitout_condition: new FormControl(false),
        needed_electric_capacity: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_cooling_capacity: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        needed_water_supply: new FormControl(false),
        needed_additional_requirements: new FormControl(''),
      })
    )
    // @ts-ignore
    console.log(this.brandTabs.controls[0].errors)
    console.log('New Brand Tab is added')
    return this.brandTabs
  }

  //Dynamically create new Table row
  newTableRow(data: TenantModel, brandsArray:BrandModel[]){
    let resultData: TenantExtendedModel = {brands_name: [], ...data}
    for (let brand of brandsArray) {
      resultData.brands_name.push(brand.brand_name)
    }
    this.rowCreate$.next(resultData)
  }

  //Dynamically update existing Table row
  updateTableRow(data: TenantModel, brandsArray:BrandModel[]) {
    let resultData: TenantExtendedModel = {brands_name: [], ...data}
    for (let brand of brandsArray) {
      resultData.brands_name.push(brand.brand_name)
    }
    this.rowUpdate$.next(resultData)
  }

  // Array of objects sorting function
  arraySorting (property: string) {
    let sortOrder = 1;
    return function (a: {},b:{}) {
      if(sortOrder == -1){
        // @ts-ignore
        return b[property].localeCompare(a[property]);
      }else{
        // @ts-ignore
        return a[property].localeCompare(b[property]);
      }
    }
  }

  // Array of strings sorting function
  arrayStringSorting () {
    let sortOrder = 1;
    return function (a: string,b:string) {
      if(sortOrder == -1){
        // @ts-ignore
        return b.localeCompare(a);
      }else{
        // @ts-ignore
        return a.localeCompare(b);
      }
    }
  }
}

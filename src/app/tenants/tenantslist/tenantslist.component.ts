import {Component,OnInit,ViewChild} from '@angular/core';
import {TenantExtendedModel, TenantModel} from "../../models/models";
import {ApiService} from "../../shared/services/api.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {NotificationService} from "../../shared/notification.service";
import {TenantService} from "../../shared/services/tenant.service";
import {TenantformComponent} from "../tenantform/tenantform.component";
import {from} from "rxjs";
import {concatMap, map, tap} from "rxjs/operators";
import {GlobalAppService} from "../../shared/services/global-app.service";

@Component({
  selector: 'app-tenantslist',
  templateUrl: './tenantslist.component.html',
  styleUrls: ['./tenantslist.component.sass']
})
export class TenantslistComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private service:TenantService,
    private globalService: GlobalAppService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
) {}

  tenantTable: TenantModel[] = []; //Initial model fetched from REST API
  tenantExtendedTable: TenantExtendedModel[] = []; //Final model based on tenantTable adding brand_names property
  //Columns displayed by Material Table
  displayedColumns: string[] = ['company_name', 'brands_name', 'contact_person_name', 'actions'];
  // @ts-ignore // Material Table datasource
  tableData: MatTableDataSource<any>
  searchKey: String = '' //Search string input

  // @ts-ignore // Material Table sorting
  @ViewChild(MatSort) sort: MatSort;
  // @ts-ignore // Material Table pagination
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    //Clearing of initial Material Table
    this.tenantExtendedTable = []

    //Fetching all brands data
    this.apiService.getBrands().subscribe(data => {
      // @ts-ignore
      this.service.brandsDatabaseArray = data}
    )

    //Fetching all tenants data
    this.apiService.getTenants()
      .pipe(
        // @ts-ignore
        tap(data=> this.tenantTable = data), //Putting data into initial model array
        // @ts-ignore
        concatMap(data=>from(data)), //Making an observable from fetched tenants data
        //Merging existing Tenant data with Brand names into one table and emitting one-by-one
        map(data => this.extendedTenantPopulate(data)), //
    ).subscribe(data => {
      //Pushing emitted tenants one-by-one into final Table model
      this.tenantExtendedTable.push(data)

      //When final Table model is finished, put into it Brand names one-by-one
      if(this.tenantExtendedTable.length === this.tenantTable.length) {
        let i = 0
          for (let tenant of this.tenantExtendedTable){
            from(tenant.brands_id)// Make an observable from tenant's brand_id array field
              .pipe(
              concatMap(id => this.apiService.getBrand(id)), //Fetch Brand name by brand_id
              map(brand=>brand.brand_name), //Transform an observable into brand_names
              )
              .subscribe({
                next: data => {
                  // Put fetched Brand names into tenant's array field and sort it in alphabet order
                tenant.brands_name.push(data)
                  tenant.brands_name = tenant.brands_name.sort(this.service.arrayStringSorting())
                  this.tenantExtendedTable = this.tenantExtendedTable.sort(this.service.arraySorting('company_name'))
                  this.tableData = new MatTableDataSource(this.tenantExtendedTable)
                  this.tableData.sort = this.sort
                  this.tableData.paginator = this.paginator
              },
                //When all brands from [brands_id] fetched and pushed into brand_names, complete
                complete: () => {
                  i++
                  //When all tenants finished, put final Table model into MatTableDataSource and apply sorting an pagination
                  if(i === this.tenantExtendedTable.length){
                    console.log('Table is updated')
                }}
              }
            )
          }
        }
    })
    // Insert new row into the Table dynamically
    this.newRow()
    // Insert updated row into the Table dynamically
    this.updateRow()
  }

  // Sorting filter function
  applyFilter() {
    this.tableData.filter = this.searchKey.trim().toLowerCase()
  }

  // Create new Tenant
  onCreate() {
    this.service.tenantFormIsLoaded$.next(true)
    this.globalService.editCardTrigger$.next(true) // Allow card editing
    this.service.newContactTabTrigger$.next(false) //Disable new contact Tab appearance, it should be triggered by user
    this.service.contact_name = [] // Clear contact names array
    this.service.contactTabs.clear() // Clear contacts form array
    this.service.brandsArray = [] //Clear
    this.service.brandTabs.clear() // Clear brand Tabs form array
    this.service.initializeNewTenantCard() // Set initial values of all form groups
    const dialogConfig = new MatDialogConfig() //create new Dialog window and set its parameters
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(TenantformComponent, dialogConfig) //open dialog window with Tenantform Component inside
  }

  // Edit existing Tenant
  onEdit(data: TenantExtendedModel) {
    this.service.tenantFormIsLoaded$.next(false)
    this.globalService.editCardTrigger$.next(true) // Allow card editing
    this.service.newContactTabTrigger$.next(false) //Disable new contact Tab appearance, it should be triggered by user
    this.service.contact_name = [] // Clear contact names array
    this.service.contactTabs.clear() // Clear contacts form array
    this.service.brandsArray = []
    this.service.brandTabs.clear() // Clear brand Tabs form array
    this.service.populateTenantCard(data)
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(TenantformComponent, dialogConfig) //open dialog window with Tenantform Component inside
  }

  // Delete Tenant
  onDelete(data: TenantExtendedModel) {
    this.apiService.deleteTenant(data.id)
      .subscribe(
        () => {
          let index = this.tenantExtendedTable.findIndex(d => d.id === data.id); //find index in your array
          this.tenantExtendedTable.splice(index, 1);//remove element from array
          this.tableData = new MatTableDataSource(this.tenantExtendedTable)
          this.notificationService.warn('Профиль арендатора удален');
          console.log('Tenant deleted')
        })
  }

  // Dynamically add new Row with Tenant data in the Material Table
  newRow(){
    this.service.newRow$.subscribe(
      data => {
        if (data.id) {
          this.tenantExtendedTable.push(data)
          this.tenantExtendedTable = this.tenantExtendedTable.sort(this.service.arraySorting('company_name'))
          this.tableData = new MatTableDataSource(this.tenantExtendedTable)
          this.tableData.sort = this.sort
          this.tableData.paginator = this.paginator
          console.log('New row created')
        }}
    )
  }

  // Dynamically update existing Row with Tenant data in the Material Table
  updateRow() {
    this.service.updateRow$.subscribe(
      data => {
        if (data.id) {
          let index = this.tenantExtendedTable.findIndex(d => d.id === data.id);//find index in your array
          this.tenantExtendedTable[index].id = data.id
          this.tenantExtendedTable[index].company_name = data.company_name
          this.tenantExtendedTable[index].brands_id = data.brands_id
          this.tenantExtendedTable[index].brands_name = data.brands_name.sort(this.service.arrayStringSorting())
          this.tenantExtendedTable[index].needed_premise_type = data.needed_premise_type
          this.tenantExtendedTable[index].description = data.description
          //form2
          this.tenantExtendedTable[index].needed_min_area = data.needed_min_area
          this.tenantExtendedTable[index].needed_max_area = data.needed_max_area
          this.tenantExtendedTable[index].needed_ceiling_height = data.needed_ceiling_height
          this.tenantExtendedTable[index].needed_fitout_condition = data.needed_fitout_condition
          this.tenantExtendedTable[index].needed_electric_capacity = data.needed_electric_capacity
          this.tenantExtendedTable[index].needed_cooling_capacity = data.needed_cooling_capacity
          this.tenantExtendedTable[index].needed_water_supply = data.needed_water_supply
          this.tenantExtendedTable[index].needed_additional_requirements = data.needed_additional_requirements
          //form3
          this.tenantExtendedTable[index].legal_name = data.legal_name
          this.tenantExtendedTable[index].tax_id = data.tax_id
          this.tenantExtendedTable[index].signing_person_name = data.signing_person_name
          this.tenantExtendedTable[index].signing_person_position = data.signing_person_position
          this.tenantExtendedTable[index].legal_address = data.legal_address
          this.tenantExtendedTable[index].postal_address = data.postal_address
          this.tenantExtendedTable[index].kpp = data.kpp
          this.tenantExtendedTable[index].bik = data.bik
          this.tenantExtendedTable[index].bank_name = data.bank_name
          this.tenantExtendedTable[index].current_account = data.current_account
          this.tenantExtendedTable[index].correspondent_account = data.correspondent_account
          this.tenantExtendedTable[index].ogrn = data.ogrn
          this.tenantExtendedTable[index].okpo = data.okpo
          this.tenantExtendedTable[index].registration_authority = data.registration_authority
          this.tenantExtendedTable[index].legal_entity_certificate_number = data.legal_entity_certificate_number
          this.tenantExtendedTable[index].last_updated = data.last_updated
          this.tenantExtendedTable[index].user_updated = data.user_updated
          console.log('Row updated')
        }
      }
    )
  }

  //Merging existing Tenant data with Brand names into one table
  extendedTenantPopulate(data:TenantModel){
    let extendedTenant: TenantExtendedModel =
      {
      id: data.id,
      company_name: data.company_name,
      needed_premise_type: data.needed_premise_type,
      brands_id: data.brands_id,
      brands_name: [],
        description: data.description,
      needed_min_area: data.needed_min_area,
      needed_max_area: data.needed_max_area,
      needed_ceiling_height: data.needed_ceiling_height,
      needed_fitout_condition: data.needed_fitout_condition ,
      needed_electric_capacity: data.needed_electric_capacity,
      needed_cooling_capacity: data.needed_cooling_capacity,
      needed_water_supply: data.needed_water_supply ,
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
      user_updated: data.user_updated
    }
    return extendedTenant
  }
}

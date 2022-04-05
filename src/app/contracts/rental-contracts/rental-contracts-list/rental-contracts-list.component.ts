import {Component,OnInit,ViewChild} from '@angular/core';
import {
  RentalContractModel,
  TenantModel,
  RentalContractModelExpanded,
  RentalContractSetupModel
} from "../../../models/models";
import {ApiService} from "../../../shared/services/api.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {RentalContractsFormComponent} from "../rental-contracts-form/rental-contracts-form.component";
import {RentalContractsService} from "../../../shared/services/rental-contracts.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract-setup.service";

import {catchError, concatMap, map, tap} from "rxjs/operators";
import {concat, forkJoin, Observable, of} from "rxjs";
import {RentalContractsSetupComponent} from "../rental-contracts-setup/rental-contracts-setup.component";
import {GlobalAppService} from "../../../shared/services/global-app.service";


@Component({
  selector: 'app-rental-contracts-list',
  templateUrl: './rental-contracts-list.component.html',
  styleUrls: ['./rental-contracts-list.component.sass']
})
export class RentalContractsListComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private service:RentalContractsService,
    private globalService: GlobalAppService,
    private setupService: RentalContractSetupService,
    private notificationService: NotificationService,
  ) {}

  rentalContractsTable: RentalContractModel[] = [];
  rentalContractsTableExpanded: RentalContractModelExpanded[] = [];
  displayedColumns: string[] = ['rent_contract_number','tenant_contractor_company_name', 'premise_number', 'brand_name', 'actions'];
  // @ts-ignore
  tableData: MatTableDataSource<any>
  searchKey: String = ''

  // @ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {

    this.globalService.contractSetupExists$.next(true)

    this.apiService.getRentalContracts().subscribe(
      (data: RentalContractModelExpanded[]) => {
        // @ts-ignore
        this.rentalContractsTableExpanded = data;
        this.service.rentalContractNumbersArray.next([])
        this.service.premiseUsedArray.next([])

        for (let row of this.rentalContractsTableExpanded)
          {
            console.log(row.rent_contract_number)
            this.service.rentalContractNumbersArray.value.push(row.rent_contract_number)
            row.tenant_contractor_company_name = '';
            row.premise_number = [''];
            row.brand_name = '';
            row.premise_number.splice(0,1)
            for (let premise_id of row.premise_id){
              this.apiService.getPremise(premise_id).subscribe(
                data => {
                  row.premise_number.push(data.number)
                  this.service.premiseUsedArray.value.push(data)
                  }
              )
            }
            if (row.tenant_contractor_id){
            this.apiService.getTenant(row.tenant_contractor_id).subscribe(
              data => {
                row.tenant_contractor_company_name = data.company_name
              }
            )}
            if (row.brand){
            this.apiService.getBrand(row.brand).subscribe(
              data=> row.brand_name = data.brand_name
            )}
          }
        console.log(this.service.rentalContractNumbersArray.value)
        this.tableData = new MatTableDataSource(this.rentalContractsTableExpanded)
        this.tableData.sort = this.sort
        this.tableData.paginator = this.paginator},
      error => {
        console.log(error)
      })
    this.newRow()
    this.updateRow()

    this.globalService.buildingSetup[this.globalService.buildingId$.value] = {
      building_id: this.globalService.buildingId$.value,
      rental_contract_setup_exist: false
    }

  }

  applyFilter() {
    this.tableData.filter = this.searchKey.trim().toLowerCase()
  }

  contractSetupAlt(){
    this.apiService.getRentalContractSetupByBuilding(this.globalService.buildingId$.value).subscribe({
        next: data => {
          // @ts-ignore
          if (data.length > 0) {
            this.globalService.contractSetupExists$.next(true)
            console.log('rental contract setup exists')
          }
          // @ts-ignore
          if (data.length == 0) {
            this.globalService.contractSetupExists$.next(false)
            console.log('rental contract setup does not exist')
          }
        },
        error: () => {
          this.globalService.contractSetupExists$.next(false)
          console.log('rental contract setup does not exist')
        }
      }
    )
    this.setupService.feeIsLoaded$.next(false)
    this.setupService.resetContractSetupCard()
    this.globalService.editCardTrigger$.next(true)
    if (this.globalService.contractSetupExists$.value)
    { console.log('Populate')
      this.apiService.getRentalContractSetupByBuilding(this.globalService.buildingId$.value)
        .pipe(
          tap (data => {
            this.setupService.contractSetup = data}),
          map (data => data[0].id),
          concatMap( data => {
            const getPeriodicalFeeSetup$ = this.apiService.getRentalContractPeriodicalFeeSetupByRentalContractSetup(data)
            const getOneTimeFeeSetup$ = this.apiService.getRentalContractOneTimeFeeSetupByRentalContractSetup(data)
            const getUtilityFeeSetup$ = this.apiService.getRentalContractUtilityFeeSetupByRentalContractSetup(data)
            return forkJoin([getPeriodicalFeeSetup$, getOneTimeFeeSetup$, getUtilityFeeSetup$])
          }
        )
        )
        .subscribe(
          data =>{
            this.setupService.periodicalFeeArray = data[0]
            this.setupService.oneTimeFeeArray = data[1]
            this.setupService.utilityFeeArray = data[2]
            this.setupService.populateRentalContractSetupCard(this.setupService.contractSetup[0])
            this.setupService.feeIsLoaded$.next(true)
          }
      )
    } if (!this.globalService.contractSetupExists$.value)
    { console.log('Initialize')
      this.setupService.initializeRentalContractSetupCard()
    }
      const dialogConfig = new MatDialogConfig()
      dialogConfig.disableClose = false
      dialogConfig.autoFocus = true
      dialogConfig.width = '1400px'
      dialogConfig.maxHeight = '90%'
      // dialogConfig.maxHeight = '100%'
      this.dialog.open(RentalContractsSetupComponent, dialogConfig)
    }


  onCreate() {
    this.service.resetContractCard()
    this.service.rentContractIsLoaded$.next(false)
    this.service.periodicalFeeSetupArray = []
    this.service.oneTimeFeeSetupArray = []
    this.service.utilityFeeSetupArray = []

    this.service.premises = []
    this.service.tenantContractors = []
    this.service.brands = []
    this.service.selectedTenantBrands = []

    const retrieveTenantsPremises = forkJoin([
      this.apiService.getTenants(),
      this.apiService.getPremises(),
      this.apiService.getBrands(),
      this.apiService.getRentalContractSetupByBuilding(this.globalService.buildingId$.value).pipe(
        tap (data => {
          this.service.contractSetup = data}),
        map (data => data[0].id),
        concatMap( data => {
          const getPeriodicalFeeSetup$ = this.apiService.getRentalContractPeriodicalFeeSetupByRentalContractSetup(data)
          const getOneTimeFeeSetup$ = this.apiService.getRentalContractOneTimeFeeSetupByRentalContractSetup(data)
          const getUtilityFeeSetup$ = this.apiService.getRentalContractUtilityFeeSetupByRentalContractSetup(data)
          return forkJoin([getPeriodicalFeeSetup$, getOneTimeFeeSetup$, getUtilityFeeSetup$])
        }
      ))
    ]
    )
    retrieveTenantsPremises.pipe(
      tap (data => {
        // @ts-ignore
        this.service.tenantContractors = data[0]
        // @ts-ignore
        this.service.premises = data[1]
        // @ts-ignore
        this.service.brands = data[2]
        this.service.periodicalFeeSetupArray = data[3][0]
        this.service.oneTimeFeeSetupArray = data[3][1]
        this.service.utilityFeeSetupArray = data[3][2]
      })
    ).subscribe(data => {
      this.service.initializeNewRentalContractCard()
      const dialogConfig = new MatDialogConfig()
      dialogConfig.disableClose = false
      dialogConfig.autoFocus = true
      dialogConfig.width = '1400px'
      dialogConfig.maxHeight = '90%'
      // dialogConfig.maxHeight = '100%'
      this.dialog.open(RentalContractsFormComponent, dialogConfig)
  })}

  onEdit(contract: RentalContractModelExpanded) {
    this.service.contract = contract
    this.service.resetContractCard()
    this.service.rentContractIsLoaded$.next(false)
    this.service.periodicalFeeSetupArray = []
    this.service.oneTimeFeeSetupArray = []
    this.service.utilityFeeSetupArray = []
    this.service.contractSetup = []

    this.service.premises = []
    this.service.tenantContractors = []
    this.service.brands = []
    this.service.selectedTenantBrands = []

    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    // dialogConfig.maxHeight = '100%'
    this.dialog.open(RentalContractsFormComponent, dialogConfig)

    const retrieveTenantsPremises = forkJoin([
      this.apiService.getTenants(),
      this.apiService.getPremises(),
      this.apiService.getBrands(),
      this.apiService.getRentalContractPeriodicalFeeByRentalContract(contract.id),
      this.apiService.getRentalContractOneTimeFeeByRentalContract(contract.id),
      this.apiService.getRentalContractUtilityFeeByRentalContract(contract.id),
    ]
    )
    retrieveTenantsPremises.pipe(
      tap (data => {
        this.service.tenantContractors = data[0]
        this.service.premises = data[1]
        this.service.brands = data[2]
        this.service.periodicalFeeContractArray = data[3]
        this.service.oneTimeFeeContractArray = data[4]
        this.service.utilityFeeContractArray = data[5]
      })
    ).subscribe(() => {
      this.service.getSelectedBrands(contract.tenant_contractor_id)
      this.service.populateRentalContractCard(contract)
      this.service.selectedPremise = contract.premise_number
      this.service.selectedTenant = contract.tenant_contractor_company_name
      this.service.selectedBrand = contract.brand_name
      this.service.rentContractIsLoaded$.next(true)

    })}

  onDelete(data: RentalContractModelExpanded) {
    this.apiService.deleteRentalContract(data.id)
      .subscribe(
        () => {
          let index = this.rentalContractsTableExpanded.findIndex(d => d.id === data.id); //find index in your array
          this.rentalContractsTableExpanded.splice(index, 1);//remove element from array
          this.tableData = new MatTableDataSource(this.rentalContractsTableExpanded)
          this.notificationService.warn('Договор аренды удален');
        })
  }

  newRow(){
    this.service.newRow$.subscribe(
      data => {
        if (data.id) {
          this.rentalContractsTableExpanded.push(data)
          this.tableData = new MatTableDataSource(this.rentalContractsTableExpanded)
          this.tableData.sort = this.sort
          this.tableData.paginator = this.paginator
        }}
    )
  }

  updateRow() {
    this.service.updateRow$.subscribe(
      data => {
        if (data.id) {
          let index = this.rentalContractsTableExpanded.findIndex(d => d.id === data.id);//find index in your array

          this.rentalContractsTableExpanded[index].id = data.id
          this.rentalContractsTableExpanded[index].rent_contract_number = data.rent_contract_number
          this.rentalContractsTableExpanded[index].rent_contract_signing_date = data.rent_contract_signing_date
          this.rentalContractsTableExpanded[index].rent_contract_expiration_date = data.rent_contract_expiration_date
          this.rentalContractsTableExpanded[index].building_id = data.building_id
          this.rentalContractsTableExpanded[index].premise_id = data.premise_id
          this.rentalContractsTableExpanded[index].contracted_area = data.contracted_area
          this.rentalContractsTableExpanded[index].tenant_contractor_id = data.tenant_contractor_id
          this.rentalContractsTableExpanded[index].brand = data.brand
          this.rentalContractsTableExpanded[index].act_of_transfer_date = data.act_of_transfer_date
          this.rentalContractsTableExpanded[index].rent_start_date = data.rent_start_date
          this.rentalContractsTableExpanded[index].premise_return_date = data.premise_return_date
          this.rentalContractsTableExpanded[index].stop_billing_date = data.stop_billing_date
          this.rentalContractsTableExpanded[index].fixed_rent_name = data.fixed_rent_name
          this.rentalContractsTableExpanded[index].fixed_rent_calculation_period = data.fixed_rent_calculation_period
          this.rentalContractsTableExpanded[index].fixed_rent_payment_period = data.fixed_rent_payment_period
          this.rentalContractsTableExpanded[index].fixed_rent_calculation_method = data.fixed_rent_calculation_method
          this.rentalContractsTableExpanded[index].fixed_rent_per_sqm = data.fixed_rent_per_sqm
          this.rentalContractsTableExpanded[index].fixed_rent_total_payment = data.fixed_rent_total_payment
          this.rentalContractsTableExpanded[index].fixed_rent_prepayment_or_postpayment = data.fixed_rent_prepayment_or_postpayment
          this.rentalContractsTableExpanded[index].fixed_rent_advance_payment_day = data.fixed_rent_advance_payment_day
          this.rentalContractsTableExpanded[index].fixed_rent_post_payment_day = data.fixed_rent_post_payment_day
          this.rentalContractsTableExpanded[index].fixed_rent_indexation_type = data.fixed_rent_indexation_type
          this.rentalContractsTableExpanded[index].fixed_rent_indexation_fixed =data.fixed_rent_indexation_fixed
          this.rentalContractsTableExpanded[index].turnover_fee_is_applicable = data.turnover_fee_is_applicable
          this.rentalContractsTableExpanded[index].turnover_fee = data.turnover_fee
          this.rentalContractsTableExpanded[index].turnover_fee_period = data.turnover_fee_period
          this.rentalContractsTableExpanded[index].turnover_data_providing_day = data.turnover_data_providing_day
          this.rentalContractsTableExpanded[index].turnover_fee_payment_day = data.turnover_fee_payment_day
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_is_applicable = data.CA_utilities_compensation_is_applicable
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_type = data.CA_utilities_compensation_type
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fixed_indexation_type = data.CA_utilities_compensation_fixed_indexation_type
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_fixed = data.CA_utilities_compensation_fee_fixed
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_fixed_indexation_type_fixed = data.CA_utilities_compensation_fee_fixed_indexation_type_fixed
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_prepayment_or_postpayment = data.CA_utilities_compensation_fee_prepayment_or_postpayment
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_advance_payment_day = data.CA_utilities_compensation_fee_advance_payment_day
          this.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_post_payment_day = data.CA_utilities_compensation_fee_post_payment_day
          this.rentalContractsTableExpanded[index].guarantee_deposit_required = data.guarantee_deposit_required
          this.rentalContractsTableExpanded[index].guarantee_deposit_coverage_number_of_periods = data.guarantee_deposit_coverage_number_of_periods
          this.rentalContractsTableExpanded[index].guarantee_deposit_type = data.guarantee_deposit_type
          this.rentalContractsTableExpanded[index].guarantee_deposit_amount = data.guarantee_deposit_amount
          this.rentalContractsTableExpanded[index].guarantee_deposit_contract_providing_date = data.guarantee_deposit_contract_providing_date
          this.rentalContractsTableExpanded[index].guarantee_deposit_actual_providing_date = data.guarantee_deposit_actual_providing_date
          this.rentalContractsTableExpanded[index].guarantee_bank_guarantee_expiration_date = data.guarantee_bank_guarantee_expiration_date
          this.rentalContractsTableExpanded[index].insurance_required = data.insurance_required
          this.rentalContractsTableExpanded[index].insurance_contract_providing_date = data.insurance_contract_providing_date
          this.rentalContractsTableExpanded[index].insurance_actual_providing_date = data.insurance_actual_providing_date
          this.rentalContractsTableExpanded[index].insurance_expiration_date = data.insurance_expiration_date
          this.rentalContractsTableExpanded[index].last_updated = data.last_updated
          this.rentalContractsTableExpanded[index].user_updated = data.user_updated

          this.rentalContractsTableExpanded[index].tenant_contractor_company_name = data.tenant_contractor_company_name
          this.rentalContractsTableExpanded[index].premise_number = data.premise_number
          this.rentalContractsTableExpanded[index].brand_name = data.brand_name
        }
      }
    )
  }

  clearContractSetup() {
    let contracts: RentalContractSetupModel[]
    this.apiService.getRentalContractSetups().subscribe(
       data => {
         // @ts-ignore
         contracts = data
         for (let contract of contracts){
           this.apiService.deleteRentalContractSetup(contract.id)
         }
       }
     )
  }
}

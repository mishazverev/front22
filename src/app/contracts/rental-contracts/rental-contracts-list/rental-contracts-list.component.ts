import {Component,OnInit,ViewChild} from '@angular/core';
import {
  RentalContractModel,
  RentalContractModelExpanded,
  RentalContractSetupModel
} from "../../../models/models";
import {ApiService} from "../../../shared/services/api.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {RentalContractsFormComponent} from "../rental-contracts-form/rental-contracts-form.component";
import {RentalContractsService} from "../../../shared/services/rental-contracts.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract-setup.service";

import {concatMap, map, tap} from "rxjs/operators";
import {BehaviorSubject, forkJoin, Subscription, zip} from "rxjs";
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
    public service:RentalContractsService,
    private globalService: GlobalAppService,
    private setupService: RentalContractSetupService,
    private notificationService: NotificationService,
  ) {}

  numberOfContracts = -1
  numberOfPremisesLoaded$ = new BehaviorSubject<number>(0)
  numberOfCompanyNamesLoaded$ = new BehaviorSubject<number>(0)
  numberOfBrandsLoaded$ = new BehaviorSubject<number>(0)
  buttonsActivateSubscription$ = new Subscription()

  rentalContractsTable: RentalContractModel[] = [];
  displayedColumns: string[] = ['rent_contract_number','tenant_contractor_company_name', 'premise_number', 'brand_name', 'actions'];
  // @ts-ignore
  tableData: MatTableDataSource<any>
  searchKey: String = ''

  // @ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    // disable buttons
    this.service.rentContractListButtonsActivateTrigger$.next(false)

    // populate global building setup
    this.globalService.buildingSetup[this.globalService.buildingId$.value] = {
      building_id: this.globalService.buildingId$.value,
      rental_contract_setup_exist: false
    }

    // check if Rent contract setup exists
    this.apiService.getRentalContractSetupByBuilding(1).subscribe(data=> {
      if (data){
        this.globalService.contractSetupExists$.next(true)
      }
    })

    // load Rent contracts to fill the list
    this.apiService.getRentalContracts().subscribe(
      (data: RentalContractModelExpanded[]) => {
        this.service.rentalContractsTableExpanded = data;
        this.numberOfContracts = this.service.rentalContractsTableExpanded.length
        this.service.rentalContractNumbersArray.next([])
        this.service.premiseUsedArray.next([])
        for (let row of this.service.rentalContractsTableExpanded)
          {
            row.tenant_contractor_company_name = '';
            row.premise_number = [];
            row.brand_name = '';
            if(row.premise_id.length > 0){
              for (let premise_id of row.premise_id){
                this.apiService.getPremise(premise_id).subscribe(
                  data => {
                    row.premise_number.push(data.number)
                    this.service.premiseUsedArray.value.push(data)
                    if (row.premise_id.length == row.premise_number.length){
                      this.numberOfPremisesLoaded$.next(this.numberOfPremisesLoaded$.value + 1)
                    }
                  }
                )
              }
            }
            if (row.tenant_contractor_id){
            this.apiService.getTenant(row.tenant_contractor_id).subscribe(
              data => {
                row.tenant_contractor_company_name = data.company_name
                this.numberOfCompanyNamesLoaded$.next(this.numberOfCompanyNamesLoaded$.value + 1)
              }
            )}
            if (row.brand){
            this.apiService.getBrand(row.brand).subscribe(
              data=> {
                row.brand_name = data.brand_name
                this.numberOfBrandsLoaded$.next(this.numberOfBrandsLoaded$.value + 1)
              }
            )}
          }
        this.tableData = new MatTableDataSource(this.service.rentalContractsTableExpanded)
        this.tableData.sort = this.sort
        this.tableData.paginator = this.paginator}
      )
    this.newRow()
    this.updateRow()

    this.buttonsActivateSubscription$ =
      zip([
        this.numberOfPremisesLoaded$, this.numberOfCompanyNamesLoaded$, this.numberOfBrandsLoaded$])
        .subscribe(data=>{
          if(
            data[0] == this.numberOfContracts
            && data[1] == this.numberOfContracts
            && data[2] == this.numberOfContracts
          ){
            this.service.rentContractListButtonsActivateTrigger$.next(true)
            console.log('Rental contracts list loading completed')
          }
        })}

  applyFilter() {
    this.tableData.filter = this.searchKey.trim().toLowerCase()
  }

  onCreate() {
    this.service.rentContractIsLoaded$.next(false)
    this.service.rentContractReset()
    this.service.rentContractDatesFormLimitsReset()

    const retrieveData = forkJoin([
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
    ])
    retrieveData.pipe(
      tap (data => {
        this.service.tenantContractors = data[0]
        this.service.premises = data[1]
        this.service.brands = data[2]
        this.service.periodicalFeeSetupArray.next(data[3][0])
        this.service.oneTimeFeeSetupArray.next(data[3][1])
        this.service.utilityFeeSetupArray.next(data[3][2])
      })
    ).subscribe(() => {
      this.service.initializeNewRentalContractCard()
      const dialogConfig = new MatDialogConfig()
      dialogConfig.disableClose = false
      dialogConfig.autoFocus = true
      dialogConfig.width = '1400px'
      dialogConfig.maxHeight = '90%'
      this.dialog.open(RentalContractsFormComponent, dialogConfig)
  })}

  onEdit(contract: RentalContractModelExpanded) {
    this.service.rentContractIsLoaded$.next(false)
    this.service.rentContractReset()
    this.service.rentContractDatesFormLimitsReset()

    this.service.contract = contract

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
        this.service.periodicalFeeContractArray.next(data[3])
        this.service.oneTimeFeeContractArray.next(data[4])
        this.service.utilityFeeContractArray.next(data[5])
      })
    ).subscribe(() => {
      this.service.populateRentalContractCard(contract)
    })
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(RentalContractsFormComponent, dialogConfig)
  }

  onDelete(data: RentalContractModelExpanded) {
    this.apiService.deleteRentalContract(data.id)
      .subscribe(
        () => {
          let index = this.service.rentalContractsTableExpanded.findIndex(d => d.id === data.id); //find index in your array
          this.service.rentalContractsTableExpanded.splice(index, 1);//remove element from array
          this.tableData = new MatTableDataSource(this.service.rentalContractsTableExpanded)
          this.notificationService.warn('Договор аренды удален');
        })
  }

  newRow(){
    this.service.newRow$.subscribe(
      data => {
        if (data.id) {
          this.service.rentalContractsTableExpanded.push(data)
          this.tableData = new MatTableDataSource(this.service.rentalContractsTableExpanded)
          this.tableData.sort = this.sort
          this.tableData.paginator = this.paginator
        }}
    )
  }

  updateRow() {
    this.service.updateRow$.subscribe(
      data => {
        if (data.id) {
          let index = this.service.rentalContractsTableExpanded.findIndex(d => d.id === data.id);//find index in your array

          this.service.rentalContractsTableExpanded[index].id = data.id
          this.service.rentalContractsTableExpanded[index].rent_contract_number = data.rent_contract_number
          this.service.rentalContractsTableExpanded[index].rent_contract_signing_date = data.rent_contract_signing_date
          this.service.rentalContractsTableExpanded[index].rent_contract_expiration_date = data.rent_contract_expiration_date
          this.service.rentalContractsTableExpanded[index].building_id = data.building_id
          this.service.rentalContractsTableExpanded[index].premise_id = data.premise_id
          this.service.rentalContractsTableExpanded[index].contracted_area = data.contracted_area
          this.service.rentalContractsTableExpanded[index].tenant_contractor_id = data.tenant_contractor_id
          this.service.rentalContractsTableExpanded[index].brand = data.brand
          this.service.rentalContractsTableExpanded[index].act_of_transfer_date = data.act_of_transfer_date
          this.service.rentalContractsTableExpanded[index].rent_start_date = data.rent_start_date
          this.service.rentalContractsTableExpanded[index].premise_return_date = data.premise_return_date
          this.service.rentalContractsTableExpanded[index].stop_billing_date = data.stop_billing_date
          this.service.rentalContractsTableExpanded[index].fixed_rent_name = data.fixed_rent_name
          this.service.rentalContractsTableExpanded[index].fixed_rent_calculation_period = data.fixed_rent_calculation_period
          this.service.rentalContractsTableExpanded[index].fixed_rent_payment_period = data.fixed_rent_payment_period
          this.service.rentalContractsTableExpanded[index].fixed_rent_calculation_method = data.fixed_rent_calculation_method
          this.service.rentalContractsTableExpanded[index].fixed_rent_per_sqm = data.fixed_rent_per_sqm
          this.service.rentalContractsTableExpanded[index].fixed_rent_total_payment = data.fixed_rent_total_payment
          this.service.rentalContractsTableExpanded[index].fixed_rent_prepayment_or_postpayment = data.fixed_rent_prepayment_or_postpayment
          this.service.rentalContractsTableExpanded[index].fixed_rent_advance_payment_day = data.fixed_rent_advance_payment_day
          this.service.rentalContractsTableExpanded[index].fixed_rent_post_payment_day = data.fixed_rent_post_payment_day
          this.service.rentalContractsTableExpanded[index].fixed_rent_indexation_type = data.fixed_rent_indexation_type
          this.service.rentalContractsTableExpanded[index].fixed_rent_indexation_fixed =data.fixed_rent_indexation_fixed
          this.service.rentalContractsTableExpanded[index].turnover_fee_is_applicable = data.turnover_fee_is_applicable
          this.service.rentalContractsTableExpanded[index].turnover_fee = data.turnover_fee
          this.service.rentalContractsTableExpanded[index].turnover_fee_period = data.turnover_fee_period
          this.service.rentalContractsTableExpanded[index].turnover_data_providing_day = data.turnover_data_providing_day
          this.service.rentalContractsTableExpanded[index].turnover_fee_payment_day = data.turnover_fee_payment_day
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_is_applicable = data.CA_utilities_compensation_is_applicable
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_type = data.CA_utilities_compensation_type
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fixed_indexation_type = data.CA_utilities_compensation_fixed_indexation_type
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_fixed = data.CA_utilities_compensation_fee_fixed
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_fixed_indexation_type_fixed = data.CA_utilities_compensation_fee_fixed_indexation_type_fixed
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_prepayment_or_postpayment = data.CA_utilities_compensation_fee_prepayment_or_postpayment
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_advance_payment_day = data.CA_utilities_compensation_fee_advance_payment_day
          this.service.rentalContractsTableExpanded[index].CA_utilities_compensation_fee_post_payment_day = data.CA_utilities_compensation_fee_post_payment_day
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_required = data.guarantee_deposit_required
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_coverage_number_of_periods = data.guarantee_deposit_coverage_number_of_periods
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_type = data.guarantee_deposit_type
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_amount = data.guarantee_deposit_amount
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_contract_providing_date = data.guarantee_deposit_contract_providing_date
          this.service.rentalContractsTableExpanded[index].guarantee_deposit_actual_providing_date = data.guarantee_deposit_actual_providing_date
          this.service.rentalContractsTableExpanded[index].guarantee_bank_guarantee_expiration_date = data.guarantee_bank_guarantee_expiration_date
          this.service.rentalContractsTableExpanded[index].insurance_required = data.insurance_required
          this.service.rentalContractsTableExpanded[index].insurance_contract_providing_date = data.insurance_contract_providing_date
          this.service.rentalContractsTableExpanded[index].insurance_actual_providing_date = data.insurance_actual_providing_date
          this.service.rentalContractsTableExpanded[index].insurance_expiration_date = data.insurance_expiration_date
          this.service.rentalContractsTableExpanded[index].last_updated = data.last_updated
          this.service.rentalContractsTableExpanded[index].user_updated = data.user_updated

          this.service.rentalContractsTableExpanded[index].tenant_contractor_company_name = data.tenant_contractor_company_name
          this.service.rentalContractsTableExpanded[index].premise_number = data.premise_number
          this.service.rentalContractsTableExpanded[index].brand_name = data.brand_name
        }
      }
    )
  }

  // Contract setup settings
  contractSetup(){
    this.apiService.getRentalContractSetupByBuilding(this.globalService.buildingId$.value).subscribe({
        next: data => {
          if (data.length > 0) {
            this.globalService.contractSetupExists$.next(true)
            console.log('Rental contract setup exists')
          }
          if (data.length == 0) {
            this.globalService.contractSetupExists$.next(false)
            console.log('Rental contract setup does not exist')
          }
        },
        error: () => {
          this.globalService.contractSetupExists$.next(false)
          console.log('Rental contract setup does not exist')
        }
      }
    )
    this.setupService.feeIsLoaded$.next(false)
    this.setupService.resetContractSetupCard()
    // this.globalService.editCardTrigger$.next(true)
    if (this.globalService.contractSetupExists$.value)
    { console.log('Populate rental contract setup')
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
    this.dialog.open(RentalContractsSetupComponent, dialogConfig)
  }

  // Delete current contract setup
  clearContractSetup() {
    let contracts: RentalContractSetupModel[]
    this.apiService.getRentalContractSetups().subscribe(
       data => {
         // @ts-ignore
         contracts = data
         for (let contract of contracts){
           this.apiService.deleteRentalContractSetup(contract.id)
         }})}}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../../shared/services/api.service";
import {DatePipe} from "@angular/common";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {GlobalAppService} from "../../../shared/services/global-app.service";
import {RentalContractsService} from "../../../shared/services/rental-contracts.service";
import {BehaviorSubject, combineLatest, merge, mergeAll, Observable, Subscription} from "rxjs";
import {tap} from "rxjs/operators";
import {
  RentalContractModel,
  RentalContractModelExpanded,
  RentalContractOneTimeFeeModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractPeriodicalFeeModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractSetupModel,
  RentalContractUtilityFeeModel,
  RentalContractUtilityFeeSetupModel
} from "../../../models/models";
import {EnumService} from "../../../shared/services/enum.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract-setup.service";
import {MaterialModule} from "../../../material/material.module";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ENTER} from "@angular/cdk/keycodes";
import {RentalContractsSetupComponent} from "../rental-contracts-setup/rental-contracts-setup.component";
import {RentalContractsFormSetupComponent} from "./rental-contracts-form-setup/rental-contracts-form-setup.component";


@Component({
  selector: 'app-rental-contracts-form',
  templateUrl: './rental-contracts-form.component.html',
  styleUrls: ['./rental-contracts-form.component.sass']
})
export class RentalContractsFormComponent implements OnInit, OnDestroy {
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER];

  constructor(
    public service: RentalContractsService,
    public enumService: EnumService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    public setupService: RentalContractSetupService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<RentalContractsFormComponent>,
    private dialog: MatDialog,
    private notificationService: NotificationService,

  )
  {}

  public brandSelectListSubscription$: Subscription = new Subscription;
  public brandSelectSubscription$: Subscription = new Subscription;
  public premiseAreaSummingSubscription$: Subscription = new Subscription;
  public contractDuration_$: Subscription = new Subscription;
  public rentContractDates$: Subscription = new Subscription()

  private selectedPremiseArea: [] = []

  ngOnInit(): void {
    // @ts-ignore
    this.service.rentContractSigningDateMin$.next(this.datepipe.transform(this.service.rentContractSigningDateMin$.value), 'YYYY-MM-dd')
    console.log(this.service.rentContractSigningDateMin$.value)

    this.globalService.editCardTrigger$.subscribe( data => {
        if (data == false){
          this.service.form_contract.disable()
          this.service.periodicalFeeTabs.disable()
          this.service.oneTimeFeeTabs.disable()
          this.service.utilityFeeTabs.disable()
        } if (data == true){
        this.service.form_contract.enable()
        this.service.periodicalFeeTabs.enable()
        this.service.oneTimeFeeTabs.enable()
        this.service.utilityFeeTabs.enable()
        }
      }
    )

    this.brandSelectListSubscription$ = this.service.form_contract.controls['tenant_contractor_id'].valueChanges.subscribe(
      data => {
        console.log('Tenant is changed')
          for (let tenant of this.service.tenantContractors){
            if (tenant.id == data){
              this.service.selectedTenant = tenant.company_name
            }
          }
          this.service.selectedTenantBrands = []
          this.service.getSelectedBrands(data)
        })

    this.brandSelectSubscription$ = this.service.form_contract.controls['brand'].valueChanges.subscribe(
      data=>{
        for (let brand of this.service.selectedTenantBrands){
          if(brand.id == data){
            this.service.selectedBrand = brand.brand_name
          }
        }
      }
    )

    this.premiseAreaSummingSubscription$ = this.service.form_contract.controls['premise_id'].valueChanges.subscribe(
      data => {
        console.log('Premise selection changed')

        this.selectedPremiseArea = []
        this.service.selectedPremise = []
        this.service.form_contract.controls['contracted_area'].setValue('')
        if (data){
        for (let id of data){
          for (let premise of this.service.premises){
            if (premise.id === id){
              // @ts-ignore
              this.selectedPremiseArea.push(premise.measured_area)
              this.service.selectedPremise.push(premise.number)
              this.service.form_contract.controls['contracted_area'].setValue(this.areaSumming(this.selectedPremiseArea))
            }
          }
        }}
      })

    this.service.guaranteeDepositCoverage$ = combineLatest([
      this.service.form_contract.controls['contracted_area'].valueChanges,
      this.service.form_contract.controls['fixed_rent_per_sqm'].valueChanges,
      this.service.form_contract.controls['fixed_rent_total_payment'].valueChanges,
      this.service.form_contract.controls['fixed_rent_calculation_period'].valueChanges,
      this.service.form_contract.controls['guarantee_deposit_amount'].valueChanges,
      this.service.fixedRentCalculationObjectSubject
    ]).subscribe( data=>{
      this.service.depositCoverageCalculation(
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
      )
    })

    this.service.depositCoverageCalculation(
      this.service.form_contract.controls['contracted_area'].value,
      this.service.form_contract.controls['fixed_rent_per_sqm'].value,
      this.service.form_contract.controls['fixed_rent_total_payment'].value,
      this.service.form_contract.controls['fixed_rent_calculation_period'].value,
      this.service.form_contract.controls['guarantee_deposit_amount'].value,
      this.service.fixedRentCalculationObjectSubject.value
    )

// Contract dates

    if (this.service.form_contract.controls['rent_contract_signing_date'].value){
      this.service.rentContractSigningDate$.next(this.service.form_contract.controls['rent_contract_signing_date'].value)}

    if (this.service.form_contract.controls['rent_contract_expiration_date'].value){
      this.service.rentContractExpirationDate$.next(this.service.form_contract.controls['rent_contract_expiration_date'].value)}

    if (this.service.form_contract.controls['rent_contract_signing_date'].value && this.service.form_contract.controls['rent_contract_expiration_date'].value){
      this.service.form_contract.controls['act_of_transfer_date'].enable()
      this.service.form_contract.controls['rent_start_date'].enable()
      this.service.form_contract.controls['premise_return_date'].enable()
      this.service.form_contract.controls['stop_billing_date'].enable()
    }
    if (!this.service.form_contract.controls['rent_contract_signing_date'].value || !this.service.form_contract.controls['rent_contract_expiration_date'].value){
      this.service.form_contract.controls['act_of_transfer_date'].disable()
      this.service.form_contract.controls['rent_start_date'].disable()
      this.service.form_contract.controls['premise_return_date'].disable()
      this.service.form_contract.controls['stop_billing_date'].disable()
    }

    this.contractDuration_$ = combineLatest([
      this.service.form_contract.controls['rent_contract_signing_date'].valueChanges,
      this.service.form_contract.controls['rent_contract_expiration_date'].valueChanges,
    ]).subscribe(value=>{
      if(value[0] && value[1]){
        let diff = this.service.dateDiff(value[0], value[1])
      }
    })

    if (this.service.form_contract.controls['guarantee_deposit_type'].value == 'Cash'
      || this.service.form_contract.controls['guarantee_deposit_type'].value == 'Corporate_guarantee'){
      this.service.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
      this.service.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable()
    }



  }

  areaSumming(area: []){
    let sum = 0
      for (let premise of area){
        sum = sum + Number(premise)
      }
    return sum
  }

  ms(time: number) {
    let year, month, day, hour, minute, second;
    second = Math.floor(time / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    month = Math.floor(day / 30);
    day = day % 30;
    year = Math.floor(month / 12);
    month = month % 12;
    return { year, month, day, hour, minute, second };
  }

  //Contract fees submitting
  submitFees(
    rentalContractData: RentalContractModel,
    periodicalFeeData: RentalContractPeriodicalFeeModel[],
    oneTimeFeeData: RentalContractOneTimeFeeModel[],
    utilityFeeData: RentalContractUtilityFeeModel[])
  {
    for (let fee of periodicalFeeData){
      fee.rent_contract_id = rentalContractData.id
      fee.last_updated = new Date
      if (!fee.id){
        this.apiService.createRentalContractPeriodicalFee(fee).subscribe(
          ()=> console.log('Periodical fee is created')
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractPeriodicalFee(fee.id, fee).subscribe(
          ()=> console.log('Periodical fee is updated')
        )
      }
    }
    for (let fee of oneTimeFeeData){
      fee.rent_contract_id = rentalContractData.id
      fee.last_updated = new Date
      // @ts-ignore
      fee.one_time_fee_contract_payment_date = this.datepipe.transform(fee.one_time_fee_contract_payment_date, 'YYYY-MM-dd')

      if (!fee.id){
        this.apiService.createRentalContractOneTimeFee(fee).subscribe(
          ()=> console.log('One time fee is created')
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractOneTimeFee(fee.id, fee).subscribe(
          ()=> console.log('One time fee is updated')
        )
      }
    }
    for (let fee of utilityFeeData){
      fee.rent_contract_id = rentalContractData.id
      fee.last_updated = new Date
      if (!fee.id){
        this.apiService.createRentalContractUtilityFee(fee).subscribe(
          ()=> console.log('Utility fee is created')
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractUtilityFee(fee.id, fee).subscribe(
          ()=> console.log('Utility fee is updated')
        )
      }
    }
  }


  //Contract card submitting
  onSubmit(){
    const rentalContractData: RentalContractModel = this.service.form_contract.value
    this.service.rentalContractNumbersArray.value.push(rentalContractData.rent_contract_number)
    const periodicalFeeData: RentalContractPeriodicalFeeModel[] = this.service.periodicalFeeTabs.getRawValue()
    const oneTimeFeeData: RentalContractOneTimeFeeModel[] = this.service.oneTimeFeeTabs.getRawValue()
    const utilityFeeData: RentalContractUtilityFeeModel[] = this.service.utilityFeeTabs.getRawValue()

    rentalContractData.last_updated =  new Date()

    // @ts-ignore
    rentalContractData.rent_contract_signing_date = this.datepipe.transform(rentalContractData.rent_contract_signing_date, 'YYYY-MM-dd')
    //@ts-ignore
    rentalContractData.rent_contract_expiration_date = this.datepipe.transform(rentalContractData.rent_contract_expiration_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.act_of_transfer_date = this.datepipe.transform(rentalContractData.act_of_transfer_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.rent_start_date = this.datepipe.transform(rentalContractData.rent_start_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.premise_return_date = this.datepipe.transform(rentalContractData.premise_return_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.stop_billing_date = this.datepipe.transform(rentalContractData.stop_billing_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.guarantee_deposit_contract_providing_date = this.datepipe.transform(rentalContractData.guarantee_deposit_contract_providing_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.guarantee_deposit_actual_providing_date = this.datepipe.transform(rentalContractData.guarantee_deposit_actual_providing_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.guarantee_bank_guarantee_expiration_date = this.datepipe.transform(rentalContractData.guarantee_bank_guarantee_expiration_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.insurance_contract_providing_date = this.datepipe.transform(rentalContractData.insurance_contract_providing_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.insurance_actual_providing_date = this.datepipe.transform(rentalContractData.insurance_actual_providing_date, 'YYYY-MM-dd')
    // @ts-ignore
    rentalContractData.insurance_expiration_date = this.datepipe.transform(rentalContractData.insurance_expiration_date, 'YYYY-MM-dd')


    if (rentalContractData.id){
    this.apiService.updateRentalContract(rentalContractData.id, rentalContractData)
      .pipe(
        tap(
          () => {
            this.submitFees(
              rentalContractData,
              periodicalFeeData,
              oneTimeFeeData,
              utilityFeeData)
          }
        )
      )
      .subscribe(data => {
        // @ts-ignore
        this.service.updateTableRow(data, this.service.selectedPremise, this.service.selectedTenant, this.service.selectedBrand)
        this.service.form_contract.reset();
        this.notificationService.success('Договор успешно обновлён');
        this.dialogRef.close()
      })
  } else {
    this.apiService.createRentalContract(rentalContractData)
      .subscribe(data=>{
        // @ts-ignore
        rentalContractData.id = data.id
        this.submitFees(
          rentalContractData,
          periodicalFeeData,
          oneTimeFeeData,
          utilityFeeData)
        // @ts-ignore
        this.service.newTableRow(data, this.service.selectedPremise, this.service.selectedTenant, this.service.selectedBrand)
        this.service.form_contract.reset()
        this.notificationService.success('Договор успешно создан');
        this.dialogRef.close()
      })
    }
  }

  contractSetupOpen(){
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    // dialogConfig.maxHeight = '100%'
    this.dialog.open(RentalContractsFormSetupComponent, dialogConfig)
  }


  //Contract card closing
  onClose() {
    this.dialogRef.close()
  }

  ngOnDestroy() {
    this.brandSelectListSubscription$.unsubscribe()
    this.premiseAreaSummingSubscription$.unsubscribe()
    this.service.rentContractPremiseSubscription$.unsubscribe()
    this.service.rentContractDateSubscription$.unsubscribe()
    this.service.rentContractDateSubscription_2$.unsubscribe()
    this.service.guaranteeDepositTypeSubscription$.unsubscribe()


    console.log('Rental contracts form is closed')
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../../shared/services/api.service";
import {DatePipe} from "@angular/common";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {GlobalAppService} from "../../../shared/services/global-app.service";
import {RentalContractsService} from "../../../shared/services/rental-contracts.service";
import {combineLatest, combineLatestWith, tap} from "rxjs/operators";
import {
  RentalContractModel,
  RentalContractOneTimeFeeModel,
  RentalContractPeriodicalFeeModel,
  RentalContractUtilityFeeModel,
} from "../../../models/models";
import {EnumService} from "../../../shared/services/enum.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract-setup.service";
import {ENTER} from "@angular/cdk/keycodes";
import {RentalContractsFormSetupComponent} from "./rental-contracts-form-setup/rental-contracts-form-setup.component";
import {Subscription} from "rxjs";

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

  ngOnInit(): void {

    // Enable or disable fee cards editing

    this.globalService.editCardTrigger$
      .pipe(
        combineLatestWith(
          this.service.rentContractDatesInOneInterval$,
          this.service.rentContractSigningDate$,
          this.service.rentContractExpirationDate$,
          )
      )
      .subscribe( data => {
        console.log(data)
        // if (!data){
        //   this.service.form_contract.disable()
        //   this.service.periodicalFeeTabs.disable()
        //   this.service.oneTimeFeeTabs.disable()
        //   this.service.utilityFeeTabs.disable()
        // } if (data && !this.service.rentContractDatesInOneInterval$){
        //   this.service.form_contract.enable()
        //   this.service.periodicalFeeTabs.enable()
        //   this.service.oneTimeFeeTabs.enable()
        //   this.service.utilityFeeTabs.enable()
        //   this.service.rentContractDatesDisable()
        // }
      })

    // @ts-ignore
    this.service.rentContractSigningDateMin$.next(this.datepipe.transform(this.service.rentContractSigningDateMin$.value), 'YYYY-MM-dd')

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

// TBD
  contractSetupOpen(){
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1400px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(RentalContractsFormSetupComponent, dialogConfig)
  }

  //Contract card closing
  onClose() {
    this.dialogRef.close()
  }

  // Subscriptions teardown
  ngOnDestroy() {
    this.service.rentContractPremiseAreaSummingSubscription$.unsubscribe()
    this.service.rentContractPremiseSubscription$.unsubscribe()
    this.service.rentContractDateSubscription$.unsubscribe()
    this.service.rentContractDateSubscription_2$.unsubscribe()
    this.service.guaranteeDepositTypeSubscription$.unsubscribe()
    this.service.guaranteeDepositCoverageSubscription$.unsubscribe()

    this.service.periodicalFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.periodicalFeeCalculationPeriodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.periodicalFeeIndexationSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.periodicalFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.service.oneTimeFeeTriggeringEventSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.oneTimeFeeTriggeringEventDaySubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.oneTimeFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.service.oneTimeFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.service.rentContractTenantChangeSubscription$.unsubscribe()
    this.service.rentContractBrandSelectSubscription$.unsubscribe()
    this.service.intervalDatesValidationSubscription$.unsubscribe()

    console.log('Rental contracts form is closed')
  }
}

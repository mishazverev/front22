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
  FixedRentStepModel
} from "../../../models/models";
import {EnumService} from "../../../shared/services/enum.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract-setup.service";
import {ENTER} from "@angular/cdk/keycodes";
import {RentalContractsFormSetupComponent} from "./rental-contracts-form-setup/rental-contracts-form-setup.component";
import {pairwise, Subscription} from "rxjs";
import {RentalContractFeesService} from "../../../shared/services/rental-contract-fees.service";
import {StepPaymentService} from "../../../shared/services/step-payment.service";

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
    public stepService: StepPaymentService,
    public feeService: RentalContractFeesService,
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

  submitStepPayments(
    rentalContractData: RentalContractModel,
    fixedRentStepData: FixedRentStepModel[]) {
    fixedRentStepData.forEach((step, index) => {
      step.rent_contract_id = rentalContractData.id
      step.last_updated = new Date()
      // @ts-ignore
      step.start_date = this.datepipe.transform(step.start_date, 'YYYY-MM-dd')
      // @ts-ignore
      step.expiration_date = this.datepipe.transform(step.expiration_date, 'YYYY-MM-dd')
      if (!step.id) {
        this.apiService.createFixedRentFeeStep(step).subscribe(
          () => console.log('New fixed rent fee step is created')
        )
      }
        if (step.id) {
          this.apiService.updateFixedRentFeeStep(step.id, step).subscribe(
            () => console.log('New fixed rent fee step is created')
          )
        }
    })
    this.stepService.fixedRentStepDeletedArray.value.forEach((step) => {
      console.log(step)
      this.apiService.deleteFixedRentFeeStep(step.id).subscribe()
      this.stepService.fixedRentStepDeletedArray.next([])
    }
    )
  }

  //Contract card submitting
  onSubmit(){
    const rentalContractData: RentalContractModel = this.service.form_contract.value
    const periodicalFeeData: RentalContractPeriodicalFeeModel[] = this.feeService.periodicalFeeTabs.getRawValue()
    const oneTimeFeeData: RentalContractOneTimeFeeModel[] = this.feeService.oneTimeFeeTabs.getRawValue()
    const utilityFeeData: RentalContractUtilityFeeModel[] = this.feeService.utilityFeeTabs.getRawValue()
    const fixedRentStepData: FixedRentStepModel[] = this.stepService.fixedRentStepFormLines.getRawValue()

    console.log(rentalContractData)
    this.cancelSubscriptions()
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
            this.submitStepPayments(
              rentalContractData,
              fixedRentStepData
            )
          }
        )
      )
      .subscribe(data => {
        // @ts-ignore
        const contract: RentalContractModel = data
        this.service.changeDateFormatFromApi(contract)
        this.service.updateTableRow(contract, this.service.selectedPremise, this.service.selectedTenant, this.service.selectedBrand)
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
        const contract: RentalContractModel = data
        this.service.changeDateFormatFromApi(contract)
        this.service.newTableRow(contract, this.service.selectedPremise, this.service.selectedTenant, this.service.selectedBrand)
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
  cancelSubscriptions(){
    this.service.rentContractPremiseAreaSummingSubscription$.unsubscribe()
    this.service.rentContractPremiseSubscription$.unsubscribe()
    this.service.rentContractDateSubscription$.unsubscribe()
    this.service.guaranteeDepositTypeSubscription$.unsubscribe()
    this.service.guaranteeDepositCoverageSubscription$.unsubscribe()

    this.feeService.periodicalFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeeCalculationPeriodSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeeIndexationSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.periodicalFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.feeService.oneTimeFeeTriggeringEventSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeeTriggeringEventDaySubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeePaymentSubscriptionArray.forEach(subscription => subscription.unsubscribe())
    this.feeService.oneTimeFeeMethodSubscriptionArray.forEach(subscription => subscription.unsubscribe())

    this.service.rentContractTenantChangeSubscription$.unsubscribe()
    this.service.rentContractBrandSelectSubscription$.unsubscribe()
    this.service.intervalDatesValidationSubscription$.unsubscribe()
    this.service.rentContractFieldsDisablingSubscription.unsubscribe()

  }

  ngOnDestroy() {
    this.cancelSubscriptions()
    console.log('Rental contracts form is closed')
  }
}

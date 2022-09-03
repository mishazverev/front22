import {Component, OnDestroy, OnInit} from '@angular/core';
import {GlobalAppService} from "../../../shared/services/global-app.service";
import {ApiService} from "../../../shared/services/api.service";
import {DatePipe} from "@angular/common";
import {MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../shared/notification.service";
import {RentalContractSetupService} from "../../../shared/services/rental-contract/rental-contract-setup.service";
import {Subscription, tap} from "rxjs";
import {EnumService} from "../../../shared/services/enum.service";
import {map} from "rxjs/operators";
import {ENTER} from "@angular/cdk/keycodes";
import {
  RentalContractOneTimeFeeSetupModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractSetupModel, RentalContractUtilityFeeSetupModel
} from "../../../models/models";

@Component({
  selector: 'app-rental-contracts-setup',
  templateUrl: './rental-contracts-setup.component.html',
  styleUrls: ['./rental-contracts-setup.component.sass']
})
export class RentalContractsSetupComponent implements OnInit, OnDestroy {
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER];

  constructor(
    public setupService: RentalContractSetupService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    public enumService: EnumService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<RentalContractsSetupComponent>,
    private notificationService: NotificationService,
  ) { }
  public fixedRentName$: Subscription = new Subscription;
  public fixedRentCalculationObject$: Subscription = new Subscription;
  public fixedRentPrePaymentOrPostPayment$: Subscription = new Subscription;
  public fixedRentIndexationType$: Subscription = new Subscription;
  public turnoverFee$: Subscription = new Subscription;

  public caUtilitiesCompensation$: Subscription = new Subscription;
  public caUtilitiesCompensationFeePrepaymentOrPostpayment$: Subscription = new Subscription;
  public caUtilitiesCompensationFeeFixedIndexationType$: Subscription = new Subscription;

  ngOnInit(): void {

    this.globalService.editCardTrigger$.subscribe( data => {
        if (data == false){
          this.setupService.contract_setup_form_step_main.disable()
          this.setupService.contract_setup_form_step_commercial.disable()
          this.setupService.contract_setup_form_step_guarantee.disable()
          this.setupService.contract_setup_form_step_tnr.disable()
          this.setupService.contract_setup_form_step_CAutils.disable()
          this.setupService.periodicalFeeSetupTabs.disable()
          this.setupService.oneTimeFeeSetupTabs.disable()
          this.setupService.utilityFeeSetupTabs.disable()
        } if (data == true){
          this.setupService.contract_setup_form_step_main.enable()
          this.setupService.contract_setup_form_step_commercial.enable()
          this.setupService.contract_setup_form_step_guarantee.enable()
          this.setupService.contract_setup_form_step_tnr.enable()
          this.setupService.contract_setup_form_step_CAutils.enable()
          this.setupService.periodicalFeeSetupTabs.enable()
          this.setupService.oneTimeFeeSetupTabs.enable()
          this.setupService.utilityFeeSetupTabs.enable()
        }
      }
    )

    this.fixedRentName$ = this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_name'].valueChanges.subscribe(
      data => this.setupService.fixedRentNameSubject.next(data)
    )

    this.fixedRentCalculationObject$ = this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_calculation_method'].valueChanges
      .pipe(
        map( data => {
          if(data == "Per_sqm"){return ('за 1 кв. м.')
          } else {return ('за помещение полностью')
          }}))
      .subscribe(
      data => {
        this.setupService.fixedRentCalculationObjectSubject.next(data)
      })

    this.fixedRentPrePaymentOrPostPayment$ =
      this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_prepayment_or_postpayment'].valueChanges
      .subscribe(data => {
        this.setupService.fixedRentPrePaymentOrPostPayment.next(data)
        console.log(data)})

    this.fixedRentIndexationType$ =
      this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_indexation_type'].valueChanges
        .subscribe(data => {
          if (data == 'Fixed') {
            this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_indexation_fixed'].enable()
          } else {
            this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_indexation_fixed'].disable()
            this.setupService.contract_setup_form_step_commercial.controls['fixed_rent_indexation_fixed'].setValue('')
          }}
        )

    this.caUtilitiesCompensation$ =
      this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_type'].valueChanges
        .subscribe(data => {
          this.setupService.caUtilitiesCompensation.next(data)
          console.log(data)})

    this.caUtilitiesCompensationFeePrepaymentOrPostpayment$ =
      this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_fee_prepayment_or_postpayment'].valueChanges
        .subscribe(data => {
          this.setupService.caUtilitiesCompensationFeePrepaymentOrPostpayment.next(data)
          console.log(data)})

    this.caUtilitiesCompensationFeeFixedIndexationType$ =
      this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_fixed_indexation_type'].valueChanges
        .subscribe(data => {
          if (data == 'Fixed') {
            this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].enable()
          } else {
            this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].disable()
            this.setupService.contract_setup_form_step_CAutils.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].setValue('')
          }}
        )

}
  formReset(){
    this.setupService.contract_setup_form_step_main.reset();
    this.setupService.contract_setup_form_step_commercial.reset();
    this.setupService.contract_setup_form_step_tnr.reset();
    this.setupService.contract_setup_form_step_CAutils.reset();
    this.setupService.contract_setup_form_step_guarantee.reset();
  }

  submitFeeSetup(
    rentalContractSetupData: RentalContractSetupModel,
    periodicalFeeSetupData: RentalContractPeriodicalFeeSetupModel[],
    oneTimeFeeSetupData: RentalContractOneTimeFeeSetupModel[],
    utilityFeeSetupData: RentalContractUtilityFeeSetupModel[])
  {
    for (let fee of periodicalFeeSetupData){
      console.log(fee)
      fee.rent_contract_setup_id = rentalContractSetupData.id
      fee.last_updated = new Date
      console.log(fee.id)
      if (!fee.id){
        this.apiService.createRentalContractPeriodicalFeeSetup(fee).subscribe(
          data => console.log(data)
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractPeriodicalFeeSetup(fee.id, fee).subscribe(
          data => console.log(data)
        )
      }
    }
    for (let fee of oneTimeFeeSetupData){
      console.log(fee.id)
      fee.rent_contract_setup_id = rentalContractSetupData.id
      fee.last_updated = new Date
      // @ts-ignore
      fee.one_time_fee_contract_payment_date = this.datepipe.transform(fee.one_time_fee_contract_payment_date, 'YYYY-MM-dd')

      if (!fee.id){
        this.apiService.createRentalContractOneTimeFeeSetup(fee).subscribe(
          data => console.log(data)
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractOneTimeFeeSetup(fee.id, fee).subscribe(
          data => console.log(data)
        )
      }
    }
    for (let fee of utilityFeeSetupData){
      console.log(fee)
      fee.rent_contract_setup_id = rentalContractSetupData.id
      fee.last_updated = new Date
      if (!fee.id){
        this.apiService.createRentalContractUtilityFeeSetup(fee).subscribe(
          data => console.log(data)
        )
      }
      if (fee.id){
        this.apiService.updateRentalContractUtilityFeeSetup(fee.id, fee).subscribe(
          data => console.log(data)
        )
      }
    }
  }

  onSubmit() {
    const rentalContractSetupData: RentalContractSetupModel = {
      ...this.setupService.contract_setup_form_step_main.getRawValue(),
      ...this.setupService.contract_setup_form_step_commercial.getRawValue(),
      ...this.setupService.contract_setup_form_step_tnr.getRawValue(),
      ...this.setupService.contract_setup_form_step_CAutils.getRawValue(),
      ...this.setupService.contract_setup_form_step_guarantee.getRawValue(),
    }
    const periodicalFeeSetupData: RentalContractPeriodicalFeeSetupModel[] = this.setupService.periodicalFeeSetupTabs.getRawValue()
    const oneTimeFeeSetupData: RentalContractOneTimeFeeSetupModel[] = this.setupService.oneTimeFeeSetupTabs.getRawValue()
    const utilityFeeSetupData: RentalContractUtilityFeeSetupModel[] = this.setupService.utilityFeeSetupTabs.getRawValue()
    rentalContractSetupData.last_updated = new Date()

    if (rentalContractSetupData.id){
      this.apiService.updateRentalContractSetup(rentalContractSetupData.id, rentalContractSetupData)
        .pipe(
          tap(
            () => {
              console.log(periodicalFeeSetupData)
              this.submitFeeSetup(
                rentalContractSetupData,
                periodicalFeeSetupData,
                oneTimeFeeSetupData,
                utilityFeeSetupData)
            }
          )
        )
        .subscribe(() => {
          this.notificationService.success('Настройки договора успешно обновлены');
        })
    } else {
      this.apiService.createRentalContractSetup(rentalContractSetupData)
        .subscribe((data) => {
                // @ts-ignore
            rentalContractSetupData.id = data.id
                this.submitFeeSetup(
                  rentalContractSetupData,
                  periodicalFeeSetupData,
                  oneTimeFeeSetupData,
                  utilityFeeSetupData)
          this.globalService.contractSetupExists$.next(true)
              }
          )
          this.notificationService.success('Настройки договора успешно созданы');
    }
    this.formReset()
    this.dialogRef.close()
  }


  onClose() {
    this.formReset()
    this.dialogRef.close()
  }

  ngOnDestroy() {
  this.fixedRentName$.unsubscribe()
  this.fixedRentCalculationObject$.unsubscribe()
  this.fixedRentPrePaymentOrPostPayment$.unsubscribe()
  this.fixedRentIndexationType$.unsubscribe()
  this.caUtilitiesCompensation$.unsubscribe()
  this.caUtilitiesCompensationFeePrepaymentOrPostpayment$.unsubscribe()
  this.caUtilitiesCompensationFeeFixedIndexationType$.unsubscribe()

    for (let sub in this.setupService.periodicalFeeIndexationSubscriptionArray){
      this.setupService.periodicalFeeIndexationSubscriptionArray[sub].unsubscribe()
    }

    for (let sub in this.setupService.periodicalFeePaymentSubscriptionArray){
      this.setupService.periodicalFeePaymentSubscriptionArray[sub].unsubscribe()
    }

    for (let sub in this.setupService.periodicalFeeMethodSubscriptionArray){
      this.setupService.periodicalFeeMethodSubscriptionArray[sub].unsubscribe()
    }

    for (let sub in this.setupService.periodicalFeeCalculationPeriodSubscriptionArray){
      this.setupService.periodicalFeeCalculationPeriodSubscriptionArray[sub].unsubscribe()
    }
    for (let sub in this.setupService.oneTimeFeeMethodSubscriptionArray){
      this.setupService.oneTimeFeeMethodSubscriptionArray[sub].unsubscribe()
    }

    for (let sub in this.setupService.oneTimeFeePaymentSubscriptionArray){
      this.setupService.oneTimeFeePaymentSubscriptionArray[sub].unsubscribe()
    }
  }
}

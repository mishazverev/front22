import { Component, OnInit } from '@angular/core';
import {RentalContractsService} from "../../../../shared/services/rental-contracts.service";
import {ENTER} from "@angular/cdk/keycodes";
import {GlobalAppService} from "../../../../shared/services/global-app.service";
import {MatDialogRef} from "@angular/material/dialog";
import {RentalContractsFormComponent} from "../rental-contracts-form.component";
import {
  RentalContractModel,
  RentalContractOneTimeFeeModel, RentalContractOneTimeFeeSetupModel,
  RentalContractPeriodicalFeeModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractSetupModel,
  RentalContractUtilityFeeModel, RentalContractUtilityFeeSetupModel
} from "../../../../models/models";
import {map, tap} from "rxjs/operators";
import {ApiService} from "../../../../shared/services/api.service";
import {NotificationService} from "../../../../shared/notification.service";
import {EnumService} from "../../../../shared/services/enum.service";
import {DatePipe} from "@angular/common";
import {combineLatest, Subscription} from "rxjs";
import {FormArray} from "@angular/forms";
import {RentalContractFeesService} from "../../../../shared/services/rental-contract-fees.service";


@Component({
  selector: 'app-rental-contracts-form-setup',
  templateUrl: './rental-contracts-form-setup.component.html',
  styleUrls: ['./rental-contracts-form-setup.component.sass']
})
export class RentalContractsFormSetupComponent implements OnInit {
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER];
  constructor(
    public service: RentalContractsService,
    public feeService: RentalContractFeesService,
    public globalService: GlobalAppService,
    public apiService: ApiService,
    private notificationService: NotificationService,
    public enumService: EnumService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<RentalContractsFormComponent>,

  ) { }
  public fixedRentName$: Subscription = new Subscription;
  public fixedRentCalculationObject$: Subscription = new Subscription;
  public fixedRentCalculationPeriod$: Subscription = new Subscription;
  public fixedRentCalculationObjectSubject$: Subscription = new Subscription;
  public fixedRentPrePaymentOrPostPayment$: Subscription = new Subscription;
  public fixedRentIndexationType$: Subscription = new Subscription;
  public turnoverFee$: Subscription = new Subscription;

  public caUtilitiesCompensation$: Subscription = new Subscription;
  public caUtilitiesCompensationFeePrepaymentOrPostpayment$: Subscription = new Subscription;
  public caUtilitiesCompensationFeeFixedIndexationType$: Subscription = new Subscription;
  ngOnInit(): void {

    this.fixedRentName$ = this.service.form_contract.controls['fixed_rent_name'].valueChanges.subscribe(
      data => this.service.fixedRentNameSubject.next(data)
    )

    this.fixedRentCalculationObject$ = this.service.form_contract.controls['fixed_rent_calculation_method'].valueChanges
      .pipe(
        map( data => {
          if(data == "Per_sqm"){
            this.service.form_contract.controls['fixed_rent_total_payment'].reset()
            this.service.guaranteeCoveredDaysValue$.next(0)
            this.service.guaranteeCoveredMonthsValue$.next(0)
            return ('за 1 кв. м.')
          }
          if(data == "Total"){
            this.service.form_contract.controls['fixed_rent_per_sqm'].reset()
            this.service.guaranteeCoveredDaysValue$.next(0)
            this.service.guaranteeCoveredMonthsValue$.next(0)
            return ('за помещение полностью')
          } else {
            return ('')
          }}))
      .subscribe(
        data => {
          this.service.fixedRentCalculationMethod$.next(data)
        })

    this.fixedRentCalculationPeriod$ = this.service.form_contract.controls['fixed_rent_calculation_period'].valueChanges
      .pipe(
        map( data => {
          if(data == "Year") {
            return ('в год')
          }
          if(data == "Month") {
            return ('в месяц')
          } else {return ('')}
        }))
      .subscribe(
        data => {
          this.service.fixedRentCalculationPeriod$.next(data)
        })

    this.fixedRentPrePaymentOrPostPayment$ =
      this.service.form_contract.controls['fixed_rent_prepayment_or_postpayment'].valueChanges
        .subscribe(data => {
          this.service.fixedRentPrePaymentOrPostPayment.next(data)
        })

    this.fixedRentIndexationType$ =
      this.service.form_contract.controls['fixed_rent_indexation_type'].valueChanges
        .subscribe(data => {
          if (data == 'Fixed') {
            this.service.form_contract.controls['fixed_rent_indexation_fixed'].enable()
          } else {
            this.service.form_contract.controls['fixed_rent_indexation_fixed'].disable()
            this.service.form_contract.controls['fixed_rent_indexation_fixed'].setValue('')
          }}
        )


    this.caUtilitiesCompensation$ =
      this.service.form_contract.controls['CA_utilities_compensation_type'].valueChanges
        .subscribe(data => {
          this.service.caUtilitiesCompensation.next(data)
        })

    this.caUtilitiesCompensationFeePrepaymentOrPostpayment$ =
      this.service.form_contract.controls['CA_utilities_compensation_fee_prepayment_or_postpayment'].valueChanges
        .subscribe(data => {
          this.service.caUtilitiesCompensationFeePrepaymentOrPostpayment.next(data)
        })

    this.caUtilitiesCompensationFeeFixedIndexationType$ =
      this.service.form_contract.controls['CA_utilities_compensation_fixed_indexation_type'].valueChanges
        .subscribe(data => {
          if (data == 'Fixed') {
            this.service.form_contract.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].enable()
          } else {
            this.service.form_contract.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].disable()
            this.service.form_contract.controls['CA_utilities_compensation_fee_fixed_indexation_type_fixed'].setValue('')
          }}
        )
  }

  submitFee(
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
          data=> {
            // @ts-ignore
            for (fee of this.service.periodicalFeeTabs.controls){
              // @ts-ignore
              console.log(fee.value['id'])

            }
            console.log('Periodical fee is created')
          }
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

  onSubmit() {
    const rentalContractData: RentalContractModel = {
      ...this.service.form_contract.getRawValue(),
    }
    const periodicalFeeData: RentalContractPeriodicalFeeModel[] = this.feeService.periodicalFeeTabs.getRawValue()
    const oneTimeFeeData: RentalContractOneTimeFeeModel[] = this.feeService.oneTimeFeeTabs.getRawValue()
    const utilityFeeData: RentalContractUtilityFeeModel[] = this.feeService.utilityFeeTabs.getRawValue()

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
              this.submitFee(
                rentalContractData,
                periodicalFeeData,
                oneTimeFeeData,
                utilityFeeData)
            }
          )
        )
        .subscribe(() => {
          this.notificationService.success('Настройки договора успешно обновлены');
        })
    } else {
      this.apiService.createRentalContract(rentalContractData)
        .subscribe((data) => {
            // @ts-ignore
            rentalContractData.id = data.id
            this.submitFee(
              rentalContractData,
              periodicalFeeData,
              oneTimeFeeData,
              utilityFeeData)
          }
        )
      this.notificationService.success('Настройки договора успешно обновлены');
    }
    this.dialogRef.close()
  }

  onSubmitAlt(){

}

  onClose() {
    this.dialogRef.close()
  }

}

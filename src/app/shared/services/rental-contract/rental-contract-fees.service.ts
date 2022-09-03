import { Injectable } from '@angular/core';
import {BehaviorSubject, Subscription} from "rxjs";
import {
  RentalContractOneTimeFeeModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractPeriodicalFeeModel,
  RentalContractPeriodicalFeeSetupModel, RentalContractUtilityFeeModel, RentalContractUtilityFeeSetupModel
} from "../../../models/models";
import {ApiService} from "../api.service";
import {GlobalAppService} from "../global-app.service";
import {EnumService} from "../enum.service";
import {FormArray, FormBuilder, FormControl, Validators} from "@angular/forms";
import {MatChipInputEvent} from "@angular/material/chips";

@Injectable({
  providedIn: 'root'
})
export class RentalContractFeesService {

  // Periodical Fees subscriptions
  public periodicalFeeMethod = new BehaviorSubject<string[]>([])
  public periodicalFeeCalculationPeriod = new BehaviorSubject<string[]>([])
  public periodicalFeePrePaymentOrPostPayment = new BehaviorSubject<string[]>([])
  public periodicalFeeIndexationType = new BehaviorSubject<string[]>([])
  public periodicalFeeNameSubject = new BehaviorSubject<string>('')
  public periodicalFeeMethodSubscriptionArray: Subscription[] = []
  public periodicalFeeCalculationPeriodSubscriptionArray: Subscription[] = []
  public periodicalFeeIndexationSubscriptionArray: Subscription[] = []
  public periodicalFeePaymentSubscriptionArray: Subscription[] = []

  // One Time Fees subscriptions
  public oneTimeFeeCalculationPeriod = new BehaviorSubject<string[]>([])
  public oneTimeFeePaymentTerm = new BehaviorSubject<string[]>([])
  public oneTimeFeeTriggeringEvent = new BehaviorSubject<string[]>([])
  public oneTimeFeeTriggeringEventDay = new BehaviorSubject<number[]>([])
  public oneTimeFeeNameSubject = new BehaviorSubject<string>('')
  public oneTimeFeeMethod = new BehaviorSubject<string[]>([])
  public oneTimeFeeTriggeringEventSubscriptionArray: Subscription[] = []
  public oneTimeFeeTriggeringEventDaySubscriptionArray: Subscription[] = []
  public oneTimeFeePaymentSubscriptionArray: Subscription[] = []
  public oneTimeFeeMethodSubscriptionArray: Subscription[] = []

  public periodicalFeeSetupArray = new BehaviorSubject<RentalContractPeriodicalFeeSetupModel[]>([]) //PeriodicalFee setup array
  public periodicalFeeContractArray = new BehaviorSubject<RentalContractPeriodicalFeeModel[]>([])// PeriodicalFee array
  public oneTimeFeeSetupArray = new BehaviorSubject<RentalContractOneTimeFeeSetupModel[]>([]) //OneTimeFee array
  public oneTimeFeeContractArray = new BehaviorSubject<RentalContractOneTimeFeeModel[]>([])  //OneTimeFee array
  public utilityFeeSetupArray = new BehaviorSubject<RentalContractUtilityFeeSetupModel[]>([]) //UtilityFee array
  public utilityFeeContractArray = new BehaviorSubject<RentalContractUtilityFeeModel[]>([]) //UtilityFee array
  public formsEnablingSubscription: Subscription = new Subscription()

  constructor(
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public enumService: EnumService,
    public fb: FormBuilder,

  ) { }

  //Array of periodical fee Tabs declare
  public periodicalFeeTabsForm = this.fb.group({
    periodicalFeeArray: this.fb.array([
    ])
  })
  public periodicalFeeTabs: FormArray = this.periodicalFeeTabsForm.get('periodicalFeeArray') as FormArray

  //Array of one time fee Tabs declare
  public oneTimeFeeTabsForm = this.fb.group({
    oneTimeFeeArray: this.fb.array([
    ])
  })
  public oneTimeFeeTabs: FormArray = this.oneTimeFeeTabsForm.get('oneTimeFeeArray') as FormArray

  //Array of utility fee Tabs declare
  public utilityFeeTabsForm = this.fb.group({
    utilityFeeArray: this.fb.array([
    ])
  })
  public utilityFeeTabs: FormArray = this.utilityFeeTabsForm.get('utilityFeeArray') as FormArray

  // Set new fee tabs

  newPeriodicalFeeContractArray(fee: RentalContractPeriodicalFeeSetupModel){
    this.periodicalFeeContractArray.value.push({
      id: Number(''),
      rent_contract_id: Number(''),
      rent_contract_additional_agreement_id: '',
      periodical_fee_name: fee.periodical_fee_name,
      periodical_fee_calculation_period: fee.periodical_fee_calculation_period,
      periodical_fee_payment_period: fee.periodical_fee_payment_period,
      periodical_fee_calculation_method: fee.periodical_fee_calculation_method,
      periodical_fee_per_sqm: fee.periodical_fee_per_sqm,
      periodical_fee_total_payment: fee.periodical_fee_total_payment,
      periodical_fee_prepayment_or_postpayment: fee.periodical_fee_prepayment_or_postpayment,
      periodical_fee_advance_payment_day: fee.periodical_fee_advance_payment_day,
      periodical_fee_post_payment_day: fee.periodical_fee_post_payment_day,
      periodical_fee_indexation_type: fee.periodical_fee_indexation_type,
      periodical_payment_indexation_fixed: fee.periodical_payment_indexation_fixed,
      last_updated: new Date(),
      user_updated: ''
    })
    this.setFeeNames()
    return this.periodicalFeeContractArray.value
  }

  newOneTimeFeeContractArray(fee: RentalContractOneTimeFeeSetupModel){
    this.oneTimeFeeContractArray.value.push({
      id: Number(''),
      rent_contract_id: Number(''),
      rent_contract_additional_agreement_id: '',
      one_time_fee_name: fee.one_time_fee_name,
      one_time_fee_calculation_method: fee.one_time_fee_calculation_method,
      one_time_fee_payment_term: fee.one_time_fee_payment_term,
      one_time_fee_per_sqm: fee.one_time_fee_per_sqm,
      one_time_fee_total_payment: fee.one_time_fee_total_payment,
      one_time_fee_contract_payment_date: fee.one_time_fee_contract_payment_date,
      one_time_fee_payment_triggering_event: fee.one_time_fee_payment_triggering_event,
      one_time_fee_contract_triggering_event_related_payment_day: fee.one_time_fee_contract_triggering_event_related_payment_day,
      last_updated: new Date(),
      user_updated: ''
    })
    this.setFeeNames()
    return this.oneTimeFeeContractArray.value
  }

  newUtilityFeeContractArray(fee: RentalContractUtilityFeeSetupModel){
    this.utilityFeeContractArray.value.push({
      id: Number(''),
      rent_contract_id: Number(''),
      rent_contract_additional_agreement_id: '',
      utility_name: fee.utility_name,
      compensation_type: fee.compensation_type,
      compensation_calculation_period: fee.compensation_calculation_period,
      compensation_payment_period: fee.compensation_payment_period,
      compensation_fixed_fee: fee.compensation_fixed_fee,
      compensation_fixed_fee_indexation_type: fee.compensation_fixed_fee_indexation_type,
      compensation_fixed_fee_indexation_fixed: fee.compensation_fixed_fee_indexation_fixed,
      compensation_fixed_fee_prepayment_or_postpayment: fee.compensation_fixed_fee_prepayment_or_postpayment,
      compensation_advance_payment_day: fee.compensation_advance_payment_day,
      compensation_counter_data_providing_day: fee.compensation_counter_data_providing_day,
      compensation_post_payment_day: fee.compensation_post_payment_day,
      last_updated: new Date(),
      user_updated: ''
    })
    return this.utilityFeeContractArray.value
  }

  // Populate Fee Tabs

  populatePeriodicalFeeTab(fee: RentalContractPeriodicalFeeModel) {
    this.periodicalFeeTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_id: new FormControl(fee.rent_contract_id),
        rent_contract_additional_agreement_id: new FormControl(fee.rent_contract_additional_agreement_id),
        periodical_fee_name: new FormControl(fee.periodical_fee_name),
        periodical_fee_calculation_period: new FormControl(fee.periodical_fee_calculation_period),
        periodical_fee_payment_period: new FormControl(fee.periodical_fee_payment_period),
        periodical_fee_calculation_method: new FormControl(fee.periodical_fee_calculation_method),
        periodical_fee_per_sqm: new FormControl(fee.periodical_fee_per_sqm, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        periodical_fee_total_payment: new FormControl(fee.periodical_fee_total_payment, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        periodical_fee_prepayment_or_postpayment: new FormControl(fee.periodical_fee_prepayment_or_postpayment),
        periodical_fee_advance_payment_day: new FormControl(fee.periodical_fee_advance_payment_day),
        periodical_fee_post_payment_day: new FormControl(fee.periodical_fee_post_payment_day),
        periodical_fee_indexation_type: new FormControl(fee.periodical_fee_indexation_type),
        periodical_payment_indexation_fixed: new FormControl(fee.periodical_payment_indexation_fixed, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        last_updated: new FormControl(fee.last_updated),
        user_updated: new FormControl(fee.user_updated),
      })
    )
    this.periodicalFeeAddSubscription(fee)
    console.log('Periodical Fee Tab is populated')
    return this.periodicalFeeTabs
  }

  populateOneTimeFeeTab(fee:RentalContractOneTimeFeeModel) {
    this.oneTimeFeeTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_id: new FormControl(fee.rent_contract_id),
        rent_contract_additional_agreement_id: new FormControl(fee.rent_contract_additional_agreement_id),
        one_time_fee_name: new FormControl(fee.one_time_fee_name),
        one_time_fee_calculation_method: new FormControl(fee.one_time_fee_calculation_method),
        one_time_fee_payment_term: new FormControl(fee.one_time_fee_payment_term),
        one_time_fee_payment_triggering_event: new FormControl(fee.one_time_fee_payment_triggering_event),
        one_time_fee_per_sqm: new FormControl(fee.one_time_fee_per_sqm, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_total_payment: new FormControl(fee.one_time_fee_total_payment, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_contract_payment_date: new FormControl(fee.one_time_fee_contract_payment_date),
        one_time_fee_contract_triggering_event_related_payment_day:
          new FormControl(fee.one_time_fee_contract_triggering_event_related_payment_day, Validators.pattern("^[0-9]{1,3}")),
        last_updated: new FormControl(fee.last_updated),
        user_updated: new FormControl(fee.user_updated),
      })
    )
    this.oneTimeFeeAddSubscription(fee)
    console.log('One Time Fee Tab is populated')
    return this.oneTimeFeeTabs
  }

  populateUtilityFeeTab(fee:RentalContractUtilityFeeModel) {
    this.utilityFeeTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_id: new FormControl(fee.rent_contract_id),
        rent_contract_additional_agreement_id: new FormControl(fee.rent_contract_additional_agreement_id),
        utility_name: new FormControl(fee.utility_name),
        compensation_type: new FormControl(fee.compensation_type),
        // counter_id: new FormControl(fee.counter_id),
        compensation_calculation_period: new FormControl(fee.compensation_calculation_period),
        compensation_payment_period: new FormControl(fee.compensation_payment_period),
        compensation_fixed_fee: new FormControl(fee.compensation_fixed_fee, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_indexation_type: new FormControl(fee.compensation_fixed_fee_indexation_type),
        compensation_fixed_fee_indexation_fixed: new FormControl(fee.compensation_fixed_fee_indexation_fixed, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_prepayment_or_postpayment: new FormControl(fee.compensation_fixed_fee_prepayment_or_postpayment),
        compensation_advance_payment_day: new FormControl(fee.compensation_advance_payment_day),
        compensation_counter_data_providing_day: new FormControl(fee.compensation_counter_data_providing_day),
        compensation_post_payment_day: new FormControl(fee.compensation_post_payment_day),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    console.log('Utility Tab is populated')
    return this.utilityFeeTabs
  }


  periodicalFeeAddSubscription(fee: RentalContractPeriodicalFeeModel){
    const i = this.periodicalFeeContractArray.value.indexOf(fee);

    if (fee.periodical_fee_prepayment_or_postpayment){
      this.periodicalFeePrePaymentOrPostPayment.value[i] = fee.periodical_fee_prepayment_or_postpayment
    } else {
      this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Prepayment'
    }

    if (fee.periodical_fee_calculation_method){
      this.periodicalFeeMethod.value[i] = fee.periodical_fee_calculation_method
    } else {
      this.periodicalFeeMethod.value[i] = 'Per_sqm'
    }

    if (fee.periodical_fee_indexation_type == 'Fixed'){
      this.periodicalFeeIndexationType.value[i] = 'Fixed'
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable({ emitEvent: false })
    }
    if (fee.periodical_fee_indexation_type == 'CPI'){
      this.periodicalFeeIndexationType.value[i] = 'CPI'
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable({ emitEvent: false })
    }
    if (fee.periodical_fee_indexation_type == 'Non_Indexable'){
      this.periodicalFeeIndexationType.value[i] = 'Non_Indexable'
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable({ emitEvent: false })
    }

    if (fee.periodical_fee_calculation_period == 'Month'){
      this.periodicalFeeCalculationPeriod.value[i] = ' в месяц'
    } if (fee.periodical_fee_calculation_period == 'Year'){
      this.periodicalFeeCalculationPeriod.value[i] = ' год'
    }

    // @ts-ignore
    this.periodicalFeeIndexationSubscriptionArray[i] =
      this.periodicalFeeTabs.controls[i].get('periodical_fee_indexation_type')?.valueChanges.subscribe(
        data=> {
          if(data == 'Fixed'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable({ emitEvent: false })
            this.periodicalFeeIndexationType.value[i] = 'Fixed'
          }
          if(data == 'CPI'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable({ emitEvent: false })
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.setValue(null)
            this.periodicalFeeIndexationType.value[i] = 'CPI'
          }
          if(data == 'Non_Indexable'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable({ emitEvent: false })
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.setValue(null)
            this.periodicalFeeIndexationType.value[i] = 'Non_Indexable'
          }
        })

    // @ts-ignore
    this.periodicalFeePaymentSubscriptionArray[i] =
      this.periodicalFeeTabs.controls[i].get('periodical_fee_prepayment_or_postpayment')?.valueChanges.subscribe(
        data=>{
          if (data == 'Prepayment') {
            this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Prepayment'
            this.periodicalFeeTabs.controls[i].get('periodical_fee_post_payment_day')?.setValue('')
          }
          if (data == 'Postpayment') {
            this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Postpayment'
            this.periodicalFeeTabs.controls[i].get('periodical_fee_advance_payment_day')?.setValue('')
          }
        }
      )

    // @ts-ignore
    this.periodicalFeeMethodSubscriptionArray[i] =
      this.periodicalFeeTabs.controls[i].get('periodical_fee_calculation_method')?.valueChanges.subscribe(
        data =>{
          if (data == 'Per_sqm'){
            this.periodicalFeeMethod.value[i] = 'Per_sqm'
            this.periodicalFeeTabs.controls[i].get('periodical_fee_total_payment')?.setValue('')
          }
          if (data == 'Total'){
            this.periodicalFeeMethod.value[i] = 'Total'
            this.periodicalFeeTabs.controls[i].get('periodical_fee_per_sqm')?.setValue('')
          }
        }
      )

    // @ts-ignore
    this.periodicalFeeCalculationPeriodSubscriptionArray[i] =
      this.periodicalFeeTabs.controls[i].get('periodical_fee_calculation_period')?.valueChanges.subscribe(
        data =>{
          if (data == 'Month'){
            this.periodicalFeeCalculationPeriod.value[i] = ' в месяц'
          }
          if (data == 'Year'){
            this.periodicalFeeCalculationPeriod.value[i] = ' в год'
          }
        }
      )
  }

  oneTimeFeeAddSubscription(fee: RentalContractOneTimeFeeModel) {
    const i = this.oneTimeFeeContractArray.value.indexOf(fee);

    if (fee.one_time_fee_calculation_method == 'Month'){
      this.oneTimeFeeCalculationPeriod.value[i] = ' в месяц'
    } if (fee.one_time_fee_calculation_method == 'Year'){
      this.oneTimeFeeCalculationPeriod.value[i] = ' год'
    }

    if (fee.one_time_fee_payment_term){
      this.oneTimeFeePaymentTerm.value[i] = fee.one_time_fee_payment_term
    } else {
      this.oneTimeFeePaymentTerm.value[i] = 'Fixed_date'
    }

    if (fee.one_time_fee_payment_term){
      this.oneTimeFeeMethod.value[i] = fee.one_time_fee_calculation_method
    } else {
      this.oneTimeFeeMethod.value[i] = 'Per_sqm'
    }

    if (fee.one_time_fee_payment_triggering_event == 'Contract_signing_date'){
      this.oneTimeFeeTriggeringEvent.value[i] = 'Даты договора'
    }
    if (fee.one_time_fee_payment_triggering_event == 'Premise_transfer_date'){
      this.oneTimeFeeTriggeringEvent.value[i] = 'Даты передачи помещения Арендатору'
    }
    if (fee.one_time_fee_payment_triggering_event == 'Start_of_commercial_activity'){
      this.oneTimeFeeTriggeringEvent.value[i] = 'Даты начала коммерческой деятельности'
    }

    // @ts-ignore
    this.oneTimeFeeTriggeringEventSubscriptionArray[i] = this.oneTimeFeeTabs.controls[i]
      .get('one_time_fee_payment_triggering_event')?.valueChanges.subscribe(
        data=> {
          if (data){
            if (data == 'Contract_signing_date'){
              this.oneTimeFeeTriggeringEvent.value[i] = 'Даты договора'
            }
            if (data == 'Premise_transfer_date'){
              this.oneTimeFeeTriggeringEvent.value[i] = 'Даты передачи помещения Арендатору'
            }
            if (data == 'Start_of_commercial_activity'){
              this.oneTimeFeeTriggeringEvent.value[i] = 'Даты начала коммерческой деятельности'
            }
            console.log(this.oneTimeFeeTriggeringEvent.value[i])
          }
        }
      )

    this.oneTimeFeeTriggeringEventDay.value[i] = this.oneTimeFeeTabs.controls[i]
      .get('one_time_fee_contract_triggering_event_related_payment_day')?.value

    // @ts-ignore
    this.oneTimeFeeTriggeringEventDaySubscriptionArray[i] = this.oneTimeFeeTabs.controls[i]
      .get('one_time_fee_contract_triggering_event_related_payment_day')?.valueChanges.subscribe(
        data => this.oneTimeFeeTriggeringEventDay.value[i] = data
      )

    // @ts-ignore
    this.oneTimeFeePaymentSubscriptionArray[i] = this.oneTimeFeeTabs.controls[i].get('one_time_fee_payment_term')?.valueChanges.subscribe(
      data=>{
        if (data == 'Fixed_date') {
          this.oneTimeFeePaymentTerm.value[i] = 'Fixed_date'
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_payment_triggering_event')?.setValue('')
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_contract_triggering_event_related_payment_day')?.setValue('')
        }
        if (data == 'Triggering_event_date') {
          this.oneTimeFeePaymentTerm.value[i] = 'Triggering_event_date'
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_contract_payment_date')?.setValue('')
        }
        if (data == 'Not_fixed') {
          this.oneTimeFeePaymentTerm.value[i] = 'Not_fixed'
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_payment_triggering_event')?.setValue('')
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_contract_triggering_event_related_payment_day')?.setValue('')
          this.oneTimeFeeTabs.controls[i].get('one_time_fee_contract_payment_date')?.setValue('')
        }
      }
    )

    // @ts-ignore
    this.oneTimeFeeMethodSubscriptionArray[i] = this.oneTimeFeeTabs.controls[i]
      .get('one_time_fee_calculation_method')?.valueChanges.subscribe(
        data=>{
          if (data == 'Per_sqm') {
            this.oneTimeFeeMethod.value[i] = 'Per_sqm'
            this.oneTimeFeeTabs.controls[i].get('one_time_fee_total_payment')?.setValue('')
          }
          if (data == 'Total') {
            this.oneTimeFeeMethod.value[i] = 'Total'
            this.oneTimeFeeTabs.controls[i].get('one_time_fee_per_sqm')?.setValue('')
          }
        }
      )

  }


  //Chips add

  addPeriodicalFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractPeriodicalFeeModel
    let i = 0
    for (let fee of this.periodicalFeeContractArray.value){
      if (feeName === fee.periodical_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.periodical_fee_name = feeName
      this.periodicalFeeContractArray.value.push(feeObject)
      this.setFeeNames()
      this.setNewPeriodicalFeeTab(feeObject.periodical_fee_name)
      this.periodicalFeeAddSubscription(feeObject)
      console.log('New periodical chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  addOneTimeFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractOneTimeFeeModel
    let i = 0
    for (let fee of this.oneTimeFeeContractArray.value){
      if (feeName === fee.one_time_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.one_time_fee_name = feeName
      this.oneTimeFeeContractArray.value.push(feeObject)
      this.setFeeNames()
      this.setNewOneTimeFeeTab(feeObject.one_time_fee_name)
      this.oneTimeFeeAddSubscription(feeObject)
      console.log('New oneTime chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  addUtilityFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractUtilityFeeModel
    let i = 0
    for (let fee of this.utilityFeeContractArray.value){
      if (feeName === fee.utility_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.utility_name = feeName
      this.utilityFeeContractArray.value.push(feeObject)
      this.setNewUtilityFeeTab(feeObject.utility_name)
      console.log('New utility chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  //Chips remove
  removePeriodicalFeeChip(fee: RentalContractPeriodicalFeeModel): void {
    const index = this.periodicalFeeContractArray.value.indexOf(fee);
    if (index >= 0) {
      for (let sub of this.periodicalFeeIndexationSubscriptionArray){
        const sub_index = this.periodicalFeeIndexationSubscriptionArray.indexOf(sub)
        if (sub_index > index){
          this.periodicalFeeIndexationSubscriptionArray[sub_index].unsubscribe()
          this.periodicalFeePaymentSubscriptionArray[sub_index].unsubscribe()
          this.periodicalFeeMethodSubscriptionArray[sub_index].unsubscribe()
          this.periodicalFeeCalculationPeriodSubscriptionArray[sub_index].unsubscribe()
        }
      }
      this.periodicalFeeIndexationSubscriptionArray.splice(index,1)
      this.periodicalFeePaymentSubscriptionArray.splice(index,1)
      this.periodicalFeeMethodSubscriptionArray.splice(index,1)
      this.periodicalFeeCalculationPeriodSubscriptionArray.splice(index,1)

      this.periodicalFeeContractArray.value.splice(index, 1);
      this.setFeeNames()
      this.periodicalFeeTabs.removeAt(index)
      for (let sub of this.periodicalFeeIndexationSubscriptionArray){
        const sub_index = this.periodicalFeeIndexationSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.periodicalFeeAddSubscription(this.periodicalFeeContractArray.value[sub_index])
        }
      }
      if (fee.id){
        this.apiService.deleteRentalContractPeriodicalFee(fee.id).subscribe(
          () => console.log('PeriodicalFee is removed')
        )
      }
    }
  }

  removeOneTimeFeeChip(fee: RentalContractOneTimeFeeModel): void {
    const index = this.oneTimeFeeContractArray.value.indexOf(fee);
    if (index >= 0) {
      for (let sub of this.oneTimeFeePaymentSubscriptionArray){
        const sub_index = this.oneTimeFeePaymentSubscriptionArray.indexOf(sub)
        if (sub_index > index){
          this.oneTimeFeePaymentSubscriptionArray[sub_index].unsubscribe()
          this.oneTimeFeeMethodSubscriptionArray[sub_index].unsubscribe()
        }
      }
      this.oneTimeFeePaymentSubscriptionArray.splice(index,1)
      this.oneTimeFeeMethodSubscriptionArray.splice(index,1)
      this.oneTimeFeeContractArray.value.splice(index, 1);
      this.setFeeNames()
      this.oneTimeFeeTabs.removeAt(index)
      for (let sub of this.oneTimeFeePaymentSubscriptionArray){
        const sub_index = this.oneTimeFeePaymentSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.oneTimeFeeAddSubscription(this.oneTimeFeeContractArray.value[sub_index])
        }
      }
      if (fee.id){
        this.apiService.deleteRentalContractOneTimeFee(fee.id).subscribe(
          () => console.log('oneTimeFee is removed')
        )
      }
    }
  }

  removeUtilityFeeChip(fee: RentalContractUtilityFeeModel): void {
    const index = this.utilityFeeContractArray.value.indexOf(fee);
    if (index >= 0) {
      this.utilityFeeContractArray.value.splice(index, 1);
      this.utilityFeeTabs.removeAt(index)
      if (fee.id){
        this.apiService.deleteRentalContractUtilityFee(fee.id).subscribe(
          () => console.log('utilityFee is removed')
        )
      }
    }
  }

  //Tabs

  setNewPeriodicalFeeTab(fee_name:string) {
    this.periodicalFeeTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
        rent_contract_additional_agreement_id: new FormControl(''),
        periodical_fee_name: new FormControl(fee_name),
        periodical_fee_calculation_period: new FormControl('Month'),
        periodical_fee_payment_period: new FormControl(''),
        periodical_fee_calculation_method: new FormControl('Per_sqm'),
        periodical_fee_per_sqm: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        periodical_fee_total_payment: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        periodical_fee_prepayment_or_postpayment: new FormControl('Prepayment'),
        periodical_fee_advance_payment_day: new FormControl(''),
        periodical_fee_post_payment_day: new FormControl(''),
        periodical_fee_indexation_type: new FormControl('Fixed'),
        periodical_payment_indexation_fixed: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })

    )
    console.log('New PeriodicalFee Tab is added')
    return this.periodicalFeeTabs
  }

  setNewOneTimeFeeTab(fee_name:string) {
    this.oneTimeFeeTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
        rent_contract_additional_agreement_id: new FormControl(''),
        one_time_fee_name: new FormControl(fee_name),
        one_time_fee_calculation_method: new FormControl('Per_sqm'),
        one_time_fee_payment_term: new FormControl('Fixed_date'),
        one_time_fee_payment_triggering_event: new FormControl(''),
        one_time_fee_per_sqm: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_total_payment: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_contract_payment_date: new FormControl(''),
        one_time_fee_contract_triggering_event_related_payment_day:
          new FormControl('', Validators.pattern("^[0-9]{1,3}")),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    // @ts-ignore
    console.log('New OneTime Tab is added')
    return this.oneTimeFeeTabs
  }

  setNewUtilityFeeTab(fee_name:string) {
    this.utilityFeeTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
        utility_name: new FormControl(fee_name),
        compensation_type: new FormControl('Using_counter'),
        compensation_calculation_period: new FormControl('Month'),
        compensation_payment_period: new FormControl('Month'),
        compensation_fixed_fee: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_indexation_type: new FormControl(''),
        compensation_fixed_fee_indexation_fixed: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_prepayment_or_postpayment: new FormControl(''),
        compensation_advance_payment_day: new FormControl(''),
        compensation_counter_data_providing_day: new FormControl(''),
        compensation_post_payment_day: new FormControl(''),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    // @ts-ignore
    console.log('New Utility Tab is added')
    return this.utilityFeeTabs
  }

  setFeeNames(){
    if (this.periodicalFeeContractArray.value.length > 0 && this.oneTimeFeeContractArray.value.length > 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('и единовременные ')
    }
    if (this.periodicalFeeContractArray.value.length == 0 && this.oneTimeFeeContractArray.value.length > 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('Единовременные ')
    }
    if (this.periodicalFeeContractArray.value.length > 0 && this.oneTimeFeeContractArray.value.length == 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('')
    }
    if (this.periodicalFeeContractArray.value.length == 0 && this.oneTimeFeeContractArray.value.length == 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('')
    }
  }

  feeFormsEnablingSubscription(){
    this.formsEnablingSubscription = this.globalService.editCardTrigger$.subscribe( data=>{
        if(!data){
            this.periodicalFeeTabs.disable({emitEvent: false})
            this.oneTimeFeeTabs.disable({emitEvent: false})
            this.utilityFeeTabs.disable({emitEvent: false})
          }
        if(data){
            this.periodicalFeeTabs.enable({emitEvent: false})
            this.oneTimeFeeTabs.enable({emitEvent: false})
            this.utilityFeeTabs.enable({emitEvent: false})
          }
        }
    )
  }
}



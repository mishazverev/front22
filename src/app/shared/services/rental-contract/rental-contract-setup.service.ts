import { Injectable } from '@angular/core';
import {
  BrandModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractSetupModel, RentalContractUtilityFeeSetupModel
} from "../../../models/models";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../api.service";
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject, Subscription} from "rxjs";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {MatChipInputEvent} from "@angular/material/chips";
import {GlobalAppService} from "../global-app.service";

@Injectable({
  providedIn: 'root'
})

export class RentalContractSetupService {
  public fixedRentNameSubject = new BehaviorSubject<string>('Арендная плата')
  public fixedRentCalculationObjectSubject = new BehaviorSubject<string>('за 1 кв. м.')
  public fixedRentPrePaymentOrPostPayment = new BehaviorSubject<string>('Prepayment')

  public turnoverFeeName = new BehaviorSubject<string>(' и % от ТО')
  public turnoverFeeIsApplicable = new BehaviorSubject<boolean>(true)

  public caUtilitiesCompensationIsApplicable = new BehaviorSubject<boolean>(true)
  public caUtilitiesCompensation = new BehaviorSubject<string>('Proportional to GLA')
  public caUtilitiesCompensationFeePrepaymentOrPostpayment = new BehaviorSubject<string>('Prepayment')

  public guaranteeDepositRequired = new BehaviorSubject<boolean>(true)
  public insuranceRequired = new BehaviorSubject<boolean>(true)

  public periodicalFeeMethod = new BehaviorSubject<string[]>([])
  public periodicalFeeCalculationPeriod = new BehaviorSubject<string[]>([])
  public periodicalFeePrePaymentOrPostPayment = new BehaviorSubject<string[]>([])

  public periodicalFeeMethodSubscriptionArray: Subscription[] = []
  public periodicalFeeCalculationPeriodSubscriptionArray: Subscription[] = []
  public periodicalFeeIndexationSubscriptionArray: Subscription[] = []
  public periodicalFeePaymentSubscriptionArray: Subscription[] = []

  public oneTimeFeeMethod = new BehaviorSubject<string[]>([])
  public oneTimeFeePaymentTerm = new BehaviorSubject<string[]>([])

  public oneTimeFeeMethodSubscriptionArray: Subscription[] = []
  public oneTimeFeePaymentSubscriptionArray: Subscription[] = []

  public feeIsLoaded$ = new BehaviorSubject<boolean>(true)


  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public modalContactDeleteDialog: MatDialog,
  ) { }

  contractSetup: RentalContractSetupModel[] = []

  periodicalFeeArray: RentalContractPeriodicalFeeSetupModel[] = [] //PeriodicalFee array
  oneTimeFeeArray: RentalContractOneTimeFeeSetupModel[] = [] //OneTimeFee array
  utilityFeeArray: RentalContractUtilityFeeSetupModel[] = [] //UtilityFee array

  contract_setup_form_step_main = this.fb.group({
    id: [''],
    building_id: [''],})

  // form_step_commercial_terms
  contract_setup_form_step_commercial = this.fb.group(
    {
    fixed_rent_name: ['', Validators.required],
    fixed_rent_calculation_period: [''],
    fixed_rent_payment_period: [''],
    fixed_rent_calculation_method: [''],
    fixed_rent_per_sqm: [''],
    fixed_rent_total_payment: [''],
    fixed_rent_prepayment_or_postpayment: [''],
    fixed_rent_advance_payment_day: [''],
    fixed_rent_post_payment_day: [''],
    fixed_rent_indexation_type: [''],
    fixed_rent_indexation_fixed: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
  })

    //form_step_turnover_rent
  contract_setup_form_step_tnr = this.fb.group(
    {
    turnover_fee_is_applicable: true,
    turnover_fee: [''],
    turnover_fee_period: [''],
    turnover_data_providing_day: [''],
    turnover_fee_payment_day: [''],
  })

    //form_step_CA_utilities
  contract_setup_form_step_CAutils = this.fb.group(
    {
    CA_utilities_compensation_is_applicable: true,
    CA_utilities_compensation_type: [''],
    CA_utilities_compensation_fixed_indexation_type: [''],
    CA_utilities_compensation_fee_fixed: [''],
    CA_utilities_compensation_fee_fixed_indexation_type_fixed: ['',Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    CA_utilities_compensation_fee_prepayment_or_postpayment:  [''],
    CA_utilities_compensation_fee_advance_payment_day:  [''],
    CA_utilities_compensation_fee_post_payment_day:  [''],
  })

    //form_step_guarantee and insurance
  contract_setup_form_step_guarantee = this.fb.group(
    {
      guarantee_deposit_required: true,
      guarantee_deposit_coverage_number_of_periods: [''],
      insurance_required: true,
      last_updated: [''],
      user_updated: [''],
    }
  )


//Array of periodical fee setup Tabs
  periodicalFeeSetupTabsForm = this.fb.group({
    periodicalFeeSetupArray: this.fb.array([
    ])
  })
  periodicalFeeSetupTabs: FormArray = this.periodicalFeeSetupTabsForm.get('periodicalFeeSetupArray') as FormArray

  //Array of one time fee setup Tabs
  oneTimeFeeSetupTabsForm = this.fb.group({
    oneTimeFeeSetupArray: this.fb.array([
    ])
  })
  oneTimeFeeSetupTabs: FormArray = this.oneTimeFeeSetupTabsForm.get('oneTimeFeeSetupArray') as FormArray

  //Array of one time fee setup Tabs
  utilityFeeSetupTabsForm = this.fb.group({
    utilityFeeSetupArray: this.fb.array([
    ])
  })
  utilityFeeSetupTabs: FormArray = this.utilityFeeSetupTabsForm.get('utilityFeeSetupArray') as FormArray

  resetContractSetupCard(){
    this.periodicalFeeArray = []
    this.periodicalFeeSetupTabs.clear()

    this.oneTimeFeeArray = []
    this.oneTimeFeeSetupTabs.clear()

    this.utilityFeeArray = []
    this.utilityFeeSetupTabs.clear()
  }


  initializeRentalContractSetupCard(){
    this.globalService.editCardTrigger$.next(true)
      this.contract_setup_form_step_main.setValue({
        id: '',
        building_id: this.globalService.buildingId$.value,
      })
      this.contract_setup_form_step_commercial.setValue({
        fixed_rent_name: this.fixedRentNameSubject.value,
        fixed_rent_calculation_period: 'Month',
        fixed_rent_payment_period: '',
        fixed_rent_calculation_method: 'Per_sqm',
        fixed_rent_per_sqm: '',
        fixed_rent_total_payment: '',
        fixed_rent_prepayment_or_postpayment: 'Prepayment',
        fixed_rent_advance_payment_day: '',
        fixed_rent_post_payment_day: '',
        fixed_rent_indexation_type: 'Fixed',
        fixed_rent_indexation_fixed: '',
      })
      this.contract_setup_form_step_tnr.setValue({
        turnover_fee_is_applicable: true,
        turnover_fee: '',
        turnover_fee_period: 'Month',
        turnover_data_providing_day: '',
        turnover_fee_payment_day: '',
      })
      this.contract_setup_form_step_CAutils.setValue({
        CA_utilities_compensation_is_applicable: true,
        CA_utilities_compensation_type: 'Proportional_to_GLA',
        CA_utilities_compensation_fixed_indexation_type: '',
        CA_utilities_compensation_fee_fixed: '',
        CA_utilities_compensation_fee_fixed_indexation_type_fixed: '',
        CA_utilities_compensation_fee_prepayment_or_postpayment:  '',
        CA_utilities_compensation_fee_advance_payment_day:  '',
        CA_utilities_compensation_fee_post_payment_day:  '',
      })
      this.contract_setup_form_step_guarantee.setValue({
        guarantee_deposit_required: true,
        guarantee_deposit_coverage_number_of_periods: '',
        insurance_required: true,
        last_updated: '',
        user_updated: '',
      })
    this.periodicalFeeArray = []
    this.periodicalFeeSetupTabs.clear()
    this.periodicalFeeSetupTabsForm.reset()
    this.oneTimeFeeArray = []
    this.oneTimeFeeSetupTabs.clear()
    this.oneTimeFeeSetupTabsForm.reset()
    this.utilityFeeArray = []
    this.utilityFeeSetupTabs.clear()
    this.utilityFeeSetupTabsForm.reset()

    const feeObject = {} as RentalContractUtilityFeeSetupModel
    feeObject.utility_name = 'Электроэнергия'
    this.utilityFeeArray.push(feeObject)
    this.setNewUtilityFeeTab(feeObject.utility_name)

  }

  populateRentalContractSetupCard(data: RentalContractSetupModel){
    this.contract_setup_form_step_main.setValue({
      id: data.id,
      building_id: data.building_id,
    })
    this.contract_setup_form_step_commercial.setValue({
      fixed_rent_name: data.fixed_rent_name,
      fixed_rent_calculation_period: data.fixed_rent_calculation_period,
      fixed_rent_payment_period: data.fixed_rent_payment_period,
      fixed_rent_calculation_method: data.fixed_rent_calculation_method,
      fixed_rent_per_sqm: data.fixed_rent_per_sqm,
      fixed_rent_total_payment: data.fixed_rent_total_payment,
      fixed_rent_prepayment_or_postpayment: data.fixed_rent_prepayment_or_postpayment,
      fixed_rent_advance_payment_day: data.fixed_rent_advance_payment_day,
      fixed_rent_post_payment_day: data.fixed_rent_advance_payment_day,
      fixed_rent_indexation_type: data.fixed_rent_indexation_type,
      fixed_rent_indexation_fixed: data.fixed_rent_indexation_fixed,
    })
    this.contract_setup_form_step_tnr.setValue({
      turnover_fee_is_applicable: data.turnover_fee_is_applicable,
      turnover_fee: data.turnover_fee,
      turnover_fee_period: data.turnover_fee_period,
      turnover_data_providing_day: data.turnover_data_providing_day,
      turnover_fee_payment_day: data.turnover_fee_payment_day,
    })
    this.contract_setup_form_step_CAutils.setValue({
      CA_utilities_compensation_is_applicable: data.CA_utilities_compensation_is_applicable,
      CA_utilities_compensation_type: data.CA_utilities_compensation_type,
      CA_utilities_compensation_fixed_indexation_type: data.CA_utilities_compensation_fixed_indexation_type,
      CA_utilities_compensation_fee_fixed: data.CA_utilities_compensation_fee_fixed,
      CA_utilities_compensation_fee_fixed_indexation_type_fixed: data.CA_utilities_compensation_fee_fixed_indexation_type_fixed,
      CA_utilities_compensation_fee_prepayment_or_postpayment: data.CA_utilities_compensation_fee_prepayment_or_postpayment,
      CA_utilities_compensation_fee_advance_payment_day: data.CA_utilities_compensation_fee_advance_payment_day,
      CA_utilities_compensation_fee_post_payment_day: data.CA_utilities_compensation_fee_post_payment_day
    })
    this.contract_setup_form_step_guarantee.setValue({
      guarantee_deposit_required: data.guarantee_deposit_required,
      guarantee_deposit_coverage_number_of_periods: data.guarantee_deposit_coverage_number_of_periods,
      insurance_required: data.insurance_required,
      last_updated: data.last_updated,
      user_updated: data.user_updated,
    })
    this.fixedRentNameSubject.next(data.fixed_rent_name)
    if (data.fixed_rent_calculation_method == 'Per_sqm'){
      this.fixedRentCalculationObjectSubject.next('за 1 кв. м.')
    }
    if (data.fixed_rent_calculation_method == 'Total'){
      this.fixedRentCalculationObjectSubject.next('за помещение полностью')
    }
    this.fixedRentPrePaymentOrPostPayment.next(data.fixed_rent_prepayment_or_postpayment)
    if (data.turnover_fee_is_applicable){
      this.turnoverFeeName.next(' и % от ТО')
    }
    if (!data.turnover_fee_is_applicable){
      this.turnoverFeeName.next('')
    }
    this.turnoverFeeIsApplicable.next(data.turnover_fee_is_applicable)
    this.caUtilitiesCompensationIsApplicable.next(data.CA_utilities_compensation_is_applicable)
    this.caUtilitiesCompensation.next(data.CA_utilities_compensation_type)
    this.caUtilitiesCompensationFeePrepaymentOrPostpayment.next(data.CA_utilities_compensation_fee_prepayment_or_postpayment)
    this.guaranteeDepositRequired.next(data.guarantee_deposit_required)
    this.insuranceRequired.next(data.insurance_required)

    for (let fee of this.periodicalFeeArray){
      console.log(fee)
      this.populatePeriodicalFeeTab(fee)
      this.periodicalFeeAddSubscription(fee)
    }
    for (let fee of this.oneTimeFeeArray){
      console.log(fee)
      this.populateOneTimeFeeTab(fee)
      this.oneTimeFeeAddSubscription(fee)
    }
    for (let fee of this.utilityFeeArray){
      console.log(fee)
      this.populateUtilityFeeTab(fee)
    }

  }

  turnoverFeeIsApplicableChange($event: MatSlideToggleChange){
    this.turnoverFeeIsApplicable.next($event.checked)
    if (this.turnoverFeeIsApplicable.value){
      this.turnoverFeeName.next(' и % от ТО')
    }
    if (!this.turnoverFeeIsApplicable.value){
      this.turnoverFeeName.next('')
    }

  }
  caUtilitiesCompensationIsApplicableChange($event: MatSlideToggleChange){
    this.caUtilitiesCompensationIsApplicable.next($event.checked)
  }
  guaranteeDepositRequiredChange($event: MatSlideToggleChange){
    this.guaranteeDepositRequired.next($event.checked)
  }
  insuranceRequiredChange($event: MatSlideToggleChange){
    this.insuranceRequired.next($event.checked)
  }

  //Chips

  //Add

  //Add new chip
  addPeriodicalFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractPeriodicalFeeSetupModel
    let i = 0
    for (let fee of this.periodicalFeeArray){
      if (feeName === fee.periodical_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.periodical_fee_name = feeName
      this.periodicalFeeArray.push(feeObject)
      this.setNewPeriodicalFeeTab(feeObject.periodical_fee_name)
      this.periodicalFeeAddSubscription(feeObject)
      console.log('New periodical chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }


  periodicalFeeAddSubscription(fee: RentalContractPeriodicalFeeSetupModel){

    const i = this.periodicalFeeArray.indexOf(fee);

    if(fee.periodical_fee_indexation_type == 'Fixed'){
      this.periodicalFeeSetupTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable()
    } else {
      this.periodicalFeeSetupTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
    }

    // @ts-ignore
    this.periodicalFeeIndexationSubscriptionArray[i] =
      this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_indexation_type')?.valueChanges.subscribe(
      data=> {
          if(data == 'Fixed'){
            this.periodicalFeeSetupTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable()
          } else {
            this.periodicalFeeSetupTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
            this.periodicalFeeSetupTabs.controls[i].get('periodical_payment_indexation_fixed')?.setValue(null)
          }
  })
    if (fee.periodical_fee_prepayment_or_postpayment){
      this.periodicalFeePrePaymentOrPostPayment.value[i] = fee.periodical_fee_prepayment_or_postpayment
    } else {
      this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Prepayment'
    }
    // @ts-ignore
    this.periodicalFeePaymentSubscriptionArray[i] =
      this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_prepayment_or_postpayment')?.valueChanges.subscribe(
      data=>{
        if (data == 'Prepayment') {
          this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Prepayment'
          this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_post_payment_day')?.setValue('')
        }
        if (data == 'Postpayment') {
          this.periodicalFeePrePaymentOrPostPayment.value[i] = 'Postpayment'
          this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_advance_payment_day')?.setValue('')
        }
      }
    )
    if (fee.periodical_fee_calculation_method){
      this.periodicalFeeMethod.value[i] = fee.periodical_fee_calculation_method
    } else {
      this.periodicalFeeMethod.value[i] = 'Per_sqm'
    }

    // @ts-ignore
    this.periodicalFeeMethodSubscriptionArray[i] =
      this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_calculation_method')?.valueChanges.subscribe(
        data =>{
          console.log(data)
          if (data == 'Per_sqm'){
            this.periodicalFeeMethod.value[i] = 'Per_sqm'
            this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_total_payment')?.setValue('')
          }
          if (data == 'Total'){
            this.periodicalFeeMethod.value[i] = 'Total'
            this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_per_sqm')?.setValue('')
          }
        }
      )

    if (fee.periodical_fee_calculation_period == 'Month' || !fee.periodical_fee_calculation_period){
      this.periodicalFeeCalculationPeriod.value[i] = ' в месяц'
    } if (fee.periodical_fee_calculation_period == 'Year'){
      this.periodicalFeeCalculationPeriod.value[i] = ' год'
    }

    // @ts-ignore
    this.periodicalFeeCalculationPeriodSubscriptionArray[i] =
      this.periodicalFeeSetupTabs.controls[i].get('periodical_fee_calculation_period')?.valueChanges.subscribe(
        data =>{
          console.log(data)
          if (data == 'Month'){
            this.periodicalFeeCalculationPeriod.value[i] = ' в месяц'
          }
          if (data == 'Year'){
            this.periodicalFeeCalculationPeriod.value[i] = ' в год'
          }
        }
      )
  }

  oneTimeFeeAddSubscription(fee: RentalContractOneTimeFeeSetupModel){
    const i = this.oneTimeFeeArray.indexOf(fee);

    if (fee.one_time_fee_payment_term){
      this.oneTimeFeePaymentTerm.value[i] = fee.one_time_fee_payment_term
    } else {
      this.oneTimeFeePaymentTerm.value[i] = 'Fixed_date'
    }

    // @ts-ignore
    this.oneTimeFeePaymentSubscriptionArray[i] = this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_payment_term')?.valueChanges.subscribe(
      data=>{
        console.log(data)
        if (data == 'Fixed_date') {
          this.oneTimeFeePaymentTerm.value[i] = 'Fixed_date'
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_payment_triggering_event')?.setValue('')
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_contract_triggering_event_related_payment_day')?.setValue('')
        }
        if (data == 'Triggering_event_date') {
          this.oneTimeFeePaymentTerm.value[i] = 'Triggering_event_date'
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_contract_payment_date')?.setValue('')
        }
        if (data == 'Not_fixed') {
          this.oneTimeFeePaymentTerm.value[i] = 'Not_fixed'
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_payment_triggering_event')?.setValue('')
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_contract_triggering_event_related_payment_day')?.setValue('')
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_contract_payment_date')?.setValue('')
        }
      }
    )

    if (fee.one_time_fee_payment_term){
      this.oneTimeFeeMethod.value[i] = fee.one_time_fee_calculation_method
    } else {
      this.oneTimeFeeMethod.value[i] = 'Per_sqm'
    }

    // @ts-ignore
    this.oneTimeFeeMethodSubscriptionArray[i] = this.oneTimeFeeSetupTabs.controls[i]
      .get('one_time_fee_calculation_method')?.valueChanges.subscribe(
      data=>{
        console.log(data)
        if (data == 'Per_sqm') {
          this.oneTimeFeeMethod.value[i] = 'Per_sqm'
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_total_payment')?.setValue('')
        }
        if (data == 'Total') {
          this.oneTimeFeeMethod.value[i] = 'Total'
          this.oneTimeFeeSetupTabs.controls[i].get('one_time_fee_per_sqm')?.setValue('')
        }
      }
    )
  }

  addOneTimeFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractOneTimeFeeSetupModel
    let i = 0
    for (let fee of this.oneTimeFeeArray){
      if (feeName === fee.one_time_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.one_time_fee_name = feeName
      this.oneTimeFeeArray.push(feeObject)
      this.setNewOneTimeFeeTab(feeObject.one_time_fee_name)
      this.oneTimeFeeAddSubscription(feeObject)
      console.log('New oneTime chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  addUtilityFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractUtilityFeeSetupModel
    let i = 0
    for (let fee of this.utilityFeeArray){
      if (feeName === fee.utility_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.utility_name = feeName
      this.utilityFeeArray.push(feeObject)
      this.setNewUtilityFeeTab(feeObject.utility_name)
      console.log('New utility chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  //Remove
  removePeriodicalFeeChip(fee: RentalContractPeriodicalFeeSetupModel): void {
    const index = this.periodicalFeeArray.indexOf(fee);
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

      this.periodicalFeeArray.splice(index, 1);
      this.periodicalFeeSetupTabs.removeAt(index)
      for (let sub of this.periodicalFeeIndexationSubscriptionArray){
        const sub_index = this.periodicalFeeIndexationSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.periodicalFeeAddSubscription(this.periodicalFeeArray[sub_index])
        }
      }
      if (fee.id){
        this.apiService.deleteRentalContractPeriodicalFeeSetup(fee.id).subscribe(
          () => console.log('PeriodicalFee is removed')
        )
      }
    }
  }

  removeOneTimeFeeChip(fee: RentalContractOneTimeFeeSetupModel): void {
    const index = this.oneTimeFeeArray.indexOf(fee);
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
      this.oneTimeFeeArray.splice(index, 1);
      this.oneTimeFeeSetupTabs.removeAt(index)
      for (let sub of this.oneTimeFeePaymentSubscriptionArray){
        const sub_index = this.oneTimeFeePaymentSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.oneTimeFeeAddSubscription(this.oneTimeFeeArray[sub_index])
        }
      }
      if (fee.id){
        this.apiService.deleteRentalContractOneTimeFeeSetup(fee.id).subscribe(
          () => console.log('oneTimeFee is removed')
        )
      }
    }
  }

  removeUtilityFeeChip(fee: RentalContractUtilityFeeSetupModel): void {
    const index = this.utilityFeeArray.indexOf(fee);
    if (index >= 0) {
      this.utilityFeeArray.splice(index, 1);
      this.utilityFeeSetupTabs.removeAt(index)
      if (fee.id){
        this.apiService.deleteRentalContractUtilityFeeSetup(fee.id).subscribe(
          () => console.log('utilityFee is removed')
        )
      }
    }
  }

  //Tabs

  // Initialize new Periodical Fee Tab
  setNewPeriodicalFeeTab(fee_name:string) {
    this.periodicalFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_setup_id: new FormControl(''),
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
    // @ts-ignore
    console.log(this.periodicalFeeSetupTabs.controls[0].errors)
    console.log('New PeriodicalFee Tab is added')
    return this.periodicalFeeSetupTabs
  }

  setNewOneTimeFeeTab(fee_name:string) {
    this.oneTimeFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_setup_id: new FormControl(''),
        one_time_fee_name: new FormControl(fee_name),
        one_time_fee_calculation_method: new FormControl('Per_sqm'),
        one_time_fee_payment_term: new FormControl('Fixed_date'),
        one_time_fee_payment_triggering_event: new FormControl(''),
        one_time_fee_per_sqm: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_total_payment: new FormControl('', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_contract_payment_date: new FormControl(''),
        one_time_fee_contract_triggering_event_related_payment_day: new FormControl(''),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    // @ts-ignore
    console.log(this.oneTimeFeeSetupTabs.controls[0].errors)
    console.log('New OneTime Tab is added')
    return this.oneTimeFeeSetupTabs
  }

  setNewUtilityFeeTab(fee_name:string) {
    this.utilityFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_setup_id: new FormControl(''),
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
    console.log(this.utilityFeeSetupTabs.controls[0].errors)
    console.log('New Utility Tab is added')
    return this.utilityFeeSetupTabs
  }

  // Populate  Periodical Fee Tab
  populatePeriodicalFeeTab(fee: RentalContractPeriodicalFeeSetupModel) {
    this.periodicalFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_setup_id: new FormControl(fee.rent_contract_setup_id),
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

    console.log('Periodical Fee Tab is populated')
    return this.periodicalFeeSetupTabs
  }

  populateOneTimeFeeTab(fee:RentalContractOneTimeFeeSetupModel) {
    this.oneTimeFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_setup_id: new FormControl(fee.rent_contract_setup_id),
        one_time_fee_name: new FormControl(fee.one_time_fee_name),
        one_time_fee_calculation_method: new FormControl(fee.one_time_fee_calculation_method),
        one_time_fee_payment_term: new FormControl(fee.one_time_fee_payment_term),
        one_time_fee_payment_triggering_event: new FormControl(fee.one_time_fee_payment_triggering_event),
        one_time_fee_per_sqm: new FormControl(fee.one_time_fee_per_sqm, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_total_payment: new FormControl(fee.one_time_fee_total_payment, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        one_time_fee_contract_payment_date: new FormControl(fee.one_time_fee_contract_payment_date),
        one_time_fee_contract_triggering_event_related_payment_day: new FormControl(fee.one_time_fee_contract_triggering_event_related_payment_day),
        last_updated: new FormControl(fee.last_updated),
        user_updated: new FormControl(fee.user_updated),
      })
    )
    console.log('One Time Fee Tab is populated')
    return this.oneTimeFeeSetupTabs
  }

  populateUtilityFeeTab(fee:RentalContractUtilityFeeSetupModel) {
    this.utilityFeeSetupTabs.push(
      this.fb.group({
        id: new FormControl(fee.id),
        rent_contract_setup_id: new FormControl(fee.rent_contract_setup_id),
        utility_name: new FormControl(fee.utility_name),
        compensation_type: new FormControl(fee.compensation_type),
        compensation_calculation_period: new FormControl(fee.compensation_calculation_period),
        compensation_payment_period: new FormControl(fee.compensation_payment_period),
        compensation_fixed_fee: new FormControl(fee.compensation_fixed_fee, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_indexation_type: new FormControl(fee.compensation_fixed_fee_indexation_type),
        compensation_fixed_fee_indexation_fixed: new FormControl(fee.compensation_fixed_fee_indexation_fixed, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")),
        compensation_fixed_fee_prepayment_or_postpayment: new FormControl(fee.compensation_fixed_fee_prepayment_or_postpayment),
        compensation_advance_payment_day: new FormControl(fee.compensation_advance_payment_day),
        compensation_counter_data_providing_day: new FormControl(fee.compensation_counter_data_providing_day),
        compensation_post_payment_day: new FormControl(fee.compensation_post_payment_day),
        last_updated: new FormControl(fee.last_updated),
        user_updated: new FormControl(fee.user_updated),
      })
    )
    console.log('Utility Tab is populated')
    return this.utilityFeeSetupTabs
  }
}

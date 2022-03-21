import { Injectable } from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, Subscription} from "rxjs";
import {
  BrandModel,
  PremiseModel,
  RentalContractModel,
  RentalContractModelExpanded,
  TenantModel,
  Select,
  RentalContractSetupModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractUtilityFeeSetupModel,
  RentalContractPeriodicalFeeModel,
  RentalContractOneTimeFeeModel,
  RentalContractUtilityFeeModel, Counter,
} from "../../models/models";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "./api.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EnumService} from "./enum.service";
import {RentalContractSetupService} from "./rental-contract-setup.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {GlobalAppService} from "./global-app.service";
import {concatMap, map, tap} from "rxjs/operators";
import {
  RentalContractsSetupComponent
} from "../../contracts/rental-contracts/rental-contracts-setup/rental-contracts-setup.component";


@Injectable({
  providedIn: 'root'
})
export class RentalContractsService {
  // @ts-ignore
  private rowCreate$ = new BehaviorSubject<RentalContractModelExpanded>([])
  newRow$ = this.rowCreate$.asObservable()
  // @ts-ignore
  private rowUpdate$ = new BehaviorSubject<RentalContractModelExpanded>([])
  updateRow$ = this.rowUpdate$.asObservable()
  public editCardTrigger$ = new BehaviorSubject<boolean>(false)
  public tenantSelected$ = new BehaviorSubject<boolean>(false)

  public periodicalFeeMethod = new BehaviorSubject<string[]>([])
  public periodicalFeeCalculationPeriod = new BehaviorSubject<string[]>([])
  public periodicalFeePrePaymentOrPostPayment = new BehaviorSubject<string[]>([])
  public periodicalFeeIndexationType = new BehaviorSubject<string[]>([])
  public periodicalFeeNameSubject = new BehaviorSubject<string>('')
  public periodicalFeeMethodSubscriptionArray: Subscription[] = []
  public periodicalFeeCalculationPeriodSubscriptionArray: Subscription[] = []
  public periodicalFeeIndexationSubscriptionArray: Subscription[] = []
  public periodicalFeePaymentSubscriptionArray: Subscription[] = []

  public oneTimeFeeCalculationPeriod = new BehaviorSubject<string[]>([])
  public oneTimeFeePaymentTerm = new BehaviorSubject<string[]>([])
  public oneTimeFeeNameSubject = new BehaviorSubject<string>('')
  public oneTimeFeeMethod = new BehaviorSubject<string[]>([])
  public oneTimeFeePaymentSubscriptionArray: Subscription[] = []
  public oneTimeFeeMethodSubscriptionArray: Subscription[] = []

  public fixedRentNameSubject = new BehaviorSubject<string>('')
  public fixedRentCalculationPeriodSubject = new BehaviorSubject<string>('')
  public fixedRentCalculationObjectSubject = new BehaviorSubject<string>('за 1 кв. м.')
  public fixedRentPrePaymentOrPostPayment = new BehaviorSubject<string>('Prepayment')

  public turnoverFeeIsApplicable$ = new BehaviorSubject<boolean>(false)
  public turnoverFeeName = new BehaviorSubject<string>('')

  public rentContractIsLoaded$ = new BehaviorSubject<boolean>(false)

  public caUtilitiesCompensationIsApplicable$ = new BehaviorSubject<boolean>(false)
  public caUtilitiesCompensation = new BehaviorSubject<string>('Proportional to GLA')
  public caUtilitiesCompensationFeePrepaymentOrPostpayment = new BehaviorSubject<string>('Prepayment')

  public insuranceIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositTypeSubscription$: Subscription = new Subscription()

  public selectedGuaranteeDepositType = this.enumService.guaranteeDepositTypes[0].value

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public setupService: RentalContractSetupService,
    public enumService: EnumService,
    public modalContactDeleteDialog: MatDialog,
){}

  premises: PremiseModel[] = []
  tenantContractors: TenantModel[] = []
  brands: BrandModel[] = []
  selectedTenantBrands: BrandModel[] = []

  countersArray: Counter[] = []

  contractSetup: RentalContractSetupModel[] = []
  contract: RentalContractModelExpanded = {
    CA_utilities_compensation_fee_advance_payment_day: 0,
    CA_utilities_compensation_fee_fixed: 0,
    CA_utilities_compensation_fee_fixed_indexation_type_fixed: 0,
    CA_utilities_compensation_fee_post_payment_day: 0,
    CA_utilities_compensation_fee_prepayment_or_postpayment: "",
    CA_utilities_compensation_fixed_indexation_type: "",
    CA_utilities_compensation_is_applicable: false,
    CA_utilities_compensation_type: "",
    act_of_transfer_date: new Date(),
    brand: 0,
    brand_name: "",
    building_id: 0,
    contracted_area: "",
    fixed_rent_advance_payment_day: 0,
    fixed_rent_calculation_method: "",
    fixed_rent_calculation_period: "",
    fixed_rent_indexation_fixed: 0,
    fixed_rent_indexation_type: "",
    fixed_rent_name: "",
    fixed_rent_payment_period: "",
    fixed_rent_per_sqm: 0,
    fixed_rent_post_payment_day: 0,
    fixed_rent_prepayment_or_postpayment: "",
    fixed_rent_total_payment: 0,
    guarantee_bank_guarantee_expiration_date: new Date(),
    guarantee_deposit_actual_providing_date: new Date(),
    guarantee_deposit_amount: 0,
    guarantee_deposit_contract_providing_date: new Date(),
    guarantee_deposit_coverage_number_of_periods: 0,
    guarantee_deposit_required: false,
    guarantee_deposit_type: "",
    id: 0,
    insurance_actual_providing_date: new Date(),
    insurance_contract_providing_date: new Date(),
    insurance_expiration_date: new Date(),
    insurance_required: false,
    last_updated: new Date(),
    premise_id: [],
    premise_number: [],
    premise_return_date: new Date(),
    rent_contract_expiration_date: new Date(),
    rent_contract_number: "",
    rent_contract_signing_date: new Date(),
    rent_start_date: new Date(),
    stop_billing_date: new Date(),
    tenant_contractor_company_name: "",
    tenant_contractor_id: 0,
    turnover_data_providing_day: 0,
    turnover_fee: 0,
    turnover_fee_is_applicable: false,
    turnover_fee_payment_day: 0,
    turnover_fee_period: "",
    user_updated: ""
  }


  periodicalFeeSetupArray: RentalContractPeriodicalFeeSetupModel[] = [] //PeriodicalFee setup array
  periodicalFeeContractArray: RentalContractPeriodicalFeeModel[] = []// PeriodicalFee array

  oneTimeFeeSetupArray: RentalContractOneTimeFeeSetupModel[] = [] //OneTimeFee array
  oneTimeFeeContractArray: RentalContractOneTimeFeeModel[] = [] //OneTimeFee array

  utilityFeeSetupArray: RentalContractUtilityFeeSetupModel[] = [] //UtilityFee array
  utilityFeeContractArray: RentalContractUtilityFeeModel[] = [] //UtilityFee array

  selectedPremise: string[] = []
  selectedTenant = ''
  selectedBrand = ''

  getSelectedBrands(tenant_id: number): BrandModel[] | void {
    this.selectedTenantBrands = []
    for (let tenant of this.tenantContractors) {
      if (tenant.id === tenant_id) {
        for (let id of tenant.brands_id) {
          for (let brand of this.brands) {
            if (id == brand.id) {
              this.selectedTenantBrands.push(brand)
              if (this.selectedTenantBrands.length == tenant.brands_id.length){
                return this.selectedTenantBrands
              }
                }
              }
            }
          }
        }
      }

  form_contract = this.fb.group({

    id: [''],
    rent_contract_number: [''],

    rent_contract_signing_date: [''],
    rent_contract_expiration_date: [''],

    building_id: [''],
    premise_id: [''],
    contracted_area: [''],

    tenant_contractor_id: [''],
    brand: [''],

    act_of_transfer_date: [''],
    rent_start_date: [''],
    premise_return_date: [''],
    stop_billing_date: [''],

    fixed_rent_name: [''],
    fixed_rent_calculation_period: [''],
    fixed_rent_payment_period: [''],
    fixed_rent_calculation_method: [''],

    fixed_rent_per_sqm: [''],
    fixed_rent_total_payment: [''],
    fixed_rent_prepayment_or_postpayment: [''],

    fixed_rent_advance_payment_day: [''],
    fixed_rent_post_payment_day: [''],
    fixed_rent_indexation_type: [''],
    fixed_rent_indexation_fixed: [''],

    turnover_fee_is_applicable: true,
    turnover_fee: [''],
    turnover_fee_period: [''],
    turnover_data_providing_day: [''],
    turnover_fee_payment_day: [''],

    CA_utilities_compensation_is_applicable: true,
    CA_utilities_compensation_type: [''],

    CA_utilities_compensation_fixed_indexation_type: [''],
    CA_utilities_compensation_fee_fixed: [''],
    CA_utilities_compensation_fee_fixed_indexation_type_fixed: [''],

    CA_utilities_compensation_fee_prepayment_or_postpayment: [''],
    CA_utilities_compensation_fee_advance_payment_day: [''],
    CA_utilities_compensation_fee_post_payment_day: [''],

    guarantee_deposit_required: true,
    guarantee_deposit_coverage_number_of_periods: [''],
    guarantee_deposit_type: [''],
    guarantee_deposit_amount: [''],
    guarantee_deposit_contract_providing_date: [''],
    guarantee_deposit_actual_providing_date: [''],
    guarantee_bank_guarantee_expiration_date: [''],

    insurance_required: false,
    insurance_contract_providing_date: [''],
    insurance_actual_providing_date: [''],
    insurance_expiration_date: [''],

    last_updated: [''],
    user_updated: [''],
  })

  //Array of periodical fee Tabs
  periodicalFeeTabsForm = this.fb.group({
    periodicalFeeArray: this.fb.array([
    ])
  })
  periodicalFeeTabs: FormArray = this.periodicalFeeTabsForm.get('periodicalFeeArray') as FormArray

  //Array of one time fee Tabs
  oneTimeFeeTabsForm = this.fb.group({
    oneTimeFeeArray: this.fb.array([
    ])
  })
  oneTimeFeeTabs: FormArray = this.oneTimeFeeTabsForm.get('oneTimeFeeArray') as FormArray

  //Array of one time fee Tabs
  utilityFeeTabsForm = this.fb.group({
    utilityFeeArray: this.fb.array([
    ])
  })
  utilityFeeTabs: FormArray = this.utilityFeeTabsForm.get('utilityFeeArray') as FormArray

  resetContractCard(){
    this.periodicalFeeSetupArray = []
    this.periodicalFeeTabs.clear()
    this.periodicalFeeContractArray = []

    this.oneTimeFeeSetupArray = []
    this.oneTimeFeeTabs.clear()
    this.oneTimeFeeContractArray = []

    this.utilityFeeSetupArray = []
    this.utilityFeeTabs.clear()
    this.utilityFeeContractArray = []
  }

  //New Contract

  initializeNewRentalContractCard(){
    this.form_contract.setValue({
      id: '',
      rent_contract_number: '',
      rent_contract_signing_date: '',
      rent_contract_expiration_date: '',

      building_id: this.contractSetup[0].building_id,
      premise_id: '',
      contracted_area: '',
      tenant_contractor_id: '',
      brand: '',
      act_of_transfer_date: '',
      rent_start_date: '',
      premise_return_date: '',
      stop_billing_date: '',

      fixed_rent_name: this.contractSetup[0].fixed_rent_name,
      fixed_rent_calculation_period: this.contractSetup[0].fixed_rent_calculation_period,
      fixed_rent_payment_period: this.contractSetup[0].fixed_rent_payment_period,
      fixed_rent_calculation_method: this.contractSetup[0].fixed_rent_calculation_method,

      fixed_rent_per_sqm: this.contractSetup[0].fixed_rent_per_sqm,
      fixed_rent_total_payment: this.contractSetup[0].fixed_rent_total_payment,
      fixed_rent_prepayment_or_postpayment: this.contractSetup[0].fixed_rent_prepayment_or_postpayment,

      fixed_rent_advance_payment_day: this.contractSetup[0].fixed_rent_advance_payment_day,
      fixed_rent_post_payment_day: this.contractSetup[0].fixed_rent_post_payment_day,
      fixed_rent_indexation_type: this.contractSetup[0].fixed_rent_indexation_type,
      fixed_rent_indexation_fixed: this.contractSetup[0].fixed_rent_indexation_fixed,

      turnover_fee_is_applicable: this.contractSetup[0].turnover_fee_is_applicable,
      turnover_fee: this.contractSetup[0].turnover_fee,
      turnover_fee_period: this.contractSetup[0].turnover_fee_period,
      turnover_data_providing_day: this.contractSetup[0].turnover_data_providing_day,
      turnover_fee_payment_day: this.contractSetup[0].turnover_fee_payment_day,

      CA_utilities_compensation_is_applicable: this.contractSetup[0].CA_utilities_compensation_is_applicable,
      CA_utilities_compensation_type: this.contractSetup[0].CA_utilities_compensation_type,

      CA_utilities_compensation_fixed_indexation_type: this.contractSetup[0].CA_utilities_compensation_fixed_indexation_type,
      CA_utilities_compensation_fee_fixed: this.contractSetup[0].CA_utilities_compensation_fee_fixed,
      CA_utilities_compensation_fee_fixed_indexation_type_fixed: this.contractSetup[0].CA_utilities_compensation_fee_fixed_indexation_type_fixed,

      CA_utilities_compensation_fee_prepayment_or_postpayment: this.contractSetup[0].CA_utilities_compensation_fee_prepayment_or_postpayment,
      CA_utilities_compensation_fee_advance_payment_day: this.contractSetup[0].CA_utilities_compensation_fee_advance_payment_day,
      CA_utilities_compensation_fee_post_payment_day: this.contractSetup[0].CA_utilities_compensation_fee_post_payment_day,

      guarantee_deposit_required: this.contractSetup[0].guarantee_deposit_required,
      guarantee_deposit_coverage_number_of_periods: this.contractSetup[0].guarantee_deposit_coverage_number_of_periods,
      guarantee_deposit_type: '',
      guarantee_deposit_amount: '',
      guarantee_deposit_contract_providing_date: '',
      guarantee_deposit_actual_providing_date: '',
      guarantee_bank_guarantee_expiration_date: '',

      insurance_required: this.contractSetup[0].insurance_required,
      insurance_contract_providing_date: '',
      insurance_actual_providing_date: '',
      insurance_expiration_date: '',

      last_updated: '',
      user_updated: '',
    })
    if (this.form_contract.controls['turnover_fee_is_applicable'].value == true){
      console.log(' и % от ТО')
      this.turnoverFeeName.next( ' и % от ТО')
      this.turnoverFeeIsApplicable$.next(true)
    }
    if (this.form_contract.controls['turnover_fee_is_applicable'].value == false){
      console.log('нет % от ТО')
      this.turnoverFeeName.next( '')
      this.turnoverFeeIsApplicable$.next(false)
    }
    this.fixedRentNameSubject.next(this.form_contract.controls['fixed_rent_name'].value)
    console.log(this.form_contract.value)
    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Month'){
      this.fixedRentCalculationPeriodSubject.next(' в месяц')
    }
    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Year'){
      this.fixedRentCalculationPeriodSubject.next(' в год')
    }
    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == true){
      this.caUtilitiesCompensationIsApplicable$.next(true)
    }
    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == false){
      this.caUtilitiesCompensationIsApplicable$.next(false)
    }
    if(this.form_contract.controls['guarantee_deposit_required'].value == true){
      this.guaranteeDepositIsRequired$.next(true)
      this.form_contract.controls['guarantee_deposit_type'].setValue(this.selectedGuaranteeDepositType)
    }
    if(this.form_contract.controls['guarantee_deposit_required'].value == false){
      this.guaranteeDepositIsRequired$.next(false)
    }
    if(this.form_contract.controls['insurance_required'].value == true){
      this.insuranceIsRequired$.next(true)
    }
    if(this.form_contract.controls['insurance_required'].value == false){
      this.insuranceIsRequired$.next(false)
    }

    console.log(this.periodicalFeeSetupArray.length)
    console.log(this.oneTimeFeeSetupArray.length)
    //
    if (this.periodicalFeeSetupArray.length > 0 && this.oneTimeFeeSetupArray.length > 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('и единовременные ')
    }
    if (this.periodicalFeeSetupArray.length == 0 && this.oneTimeFeeSetupArray.length > 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('Единовременные ')
    }
    if (this.periodicalFeeSetupArray.length > 0 && this.oneTimeFeeSetupArray.length == 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('')
    }
    if (this.periodicalFeeSetupArray.length == 0 && this.oneTimeFeeSetupArray.length == 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('')
    }
    for(let fee of this.periodicalFeeSetupArray){
      this.newPeriodicalFeeContractArray(fee)
    }
    for(let fee of this.oneTimeFeeSetupArray){
      this.newOneTimeFeeContractArray(fee)
    }
    for(let fee of this.utilityFeeSetupArray){
      this.newUtilityFeeContractArray(fee)
    }
    for(let fee of this.periodicalFeeContractArray){
      console.log(this.periodicalFeeContractArray)
      this.populatePeriodicalFeeTab(fee)
    }
    for(let fee of this.oneTimeFeeContractArray){
      this.populateOneTimeFeeTab(fee)
    }
    for(let fee of this.utilityFeeContractArray){
      this.populateUtilityFeeTab(fee)
    }
    for(let fee of this.periodicalFeeContractArray){
      this.periodicalFeeAddSubscription(fee)
    }
    this.rentalContractAddSubscription()
    this.rentContractIsLoaded$.next(true)
    console.log(this.rentContractIsLoaded$.value)

    this.globalService.editCardTrigger$.next(true)
  }

  //Arrays

  newPeriodicalFeeContractArray(fee: RentalContractPeriodicalFeeSetupModel){
    this.periodicalFeeContractArray.push({
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
    return this.periodicalFeeContractArray
  }

  newOneTimeFeeContractArray(fee: RentalContractOneTimeFeeSetupModel){
    this.oneTimeFeeContractArray.push({
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
    return this.oneTimeFeeContractArray
  }

  newUtilityFeeContractArray(fee: RentalContractUtilityFeeSetupModel){
    this.utilityFeeContractArray.push({
      id: Number(''),
      rent_contract_id: Number(''),
      rent_contract_additional_agreement_id: '',
      utility_name: fee.utility_name,
      compensation_type: fee.compensation_type,
      // counter_id: [],
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
    return this.utilityFeeContractArray
  }

  // Populate  Periodical Fee Tab

  populatePeriodicalFeeTab(fee: RentalContractPeriodicalFeeModel) {
    console.log(fee)
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
        one_time_fee_contract_triggering_event_related_payment_day: new FormControl(fee.one_time_fee_contract_triggering_event_related_payment_day),
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

  populateRentalContractCard(data: RentalContractModelExpanded) {

    this.form_contract.setValue({
      id: data.id,
      rent_contract_number: data.rent_contract_number,
      rent_contract_signing_date: data.rent_contract_signing_date,
      rent_contract_expiration_date: data.rent_contract_expiration_date,
      building_id: data.building_id,
      premise_id: data.premise_id,
      contracted_area: data.contracted_area,
      tenant_contractor_id: data.tenant_contractor_id,
      brand: data.brand,
      act_of_transfer_date: data.act_of_transfer_date,
      rent_start_date: data.rent_start_date,
      premise_return_date: data.premise_return_date,
      stop_billing_date: data.stop_billing_date,

      fixed_rent_name: data.fixed_rent_name,
      fixed_rent_calculation_period: data.fixed_rent_calculation_period,
      fixed_rent_payment_period: data.fixed_rent_payment_period,
      fixed_rent_calculation_method: data.fixed_rent_calculation_method,

      fixed_rent_per_sqm: data.fixed_rent_per_sqm,
      fixed_rent_total_payment: data.fixed_rent_total_payment,
      fixed_rent_prepayment_or_postpayment: data.fixed_rent_prepayment_or_postpayment,

      fixed_rent_advance_payment_day: data.fixed_rent_advance_payment_day,
      fixed_rent_post_payment_day: data.fixed_rent_post_payment_day,
      fixed_rent_indexation_type: data.fixed_rent_indexation_type,
      fixed_rent_indexation_fixed: data.fixed_rent_indexation_fixed,

      turnover_fee_is_applicable: data.turnover_fee_is_applicable,
      turnover_fee: data.turnover_fee,
      turnover_fee_period: data.turnover_fee_period,
      turnover_data_providing_day: data.turnover_data_providing_day,
      turnover_fee_payment_day: data.turnover_fee_payment_day,

      CA_utilities_compensation_is_applicable: data.CA_utilities_compensation_is_applicable,
      CA_utilities_compensation_type: data.CA_utilities_compensation_type,

      CA_utilities_compensation_fixed_indexation_type: data.CA_utilities_compensation_fixed_indexation_type,
      CA_utilities_compensation_fee_fixed: data.CA_utilities_compensation_fee_fixed,
      CA_utilities_compensation_fee_fixed_indexation_type_fixed: data.CA_utilities_compensation_fee_fixed_indexation_type_fixed,

      CA_utilities_compensation_fee_prepayment_or_postpayment: data.CA_utilities_compensation_fee_prepayment_or_postpayment,
      CA_utilities_compensation_fee_advance_payment_day: data.CA_utilities_compensation_fee_advance_payment_day,
      CA_utilities_compensation_fee_post_payment_day: data.CA_utilities_compensation_fee_post_payment_day,

      guarantee_deposit_required: data.guarantee_deposit_required,
      guarantee_deposit_coverage_number_of_periods: data.guarantee_deposit_coverage_number_of_periods,
      guarantee_deposit_type: data.guarantee_deposit_type,
      guarantee_deposit_amount: data.guarantee_deposit_amount,
      guarantee_deposit_contract_providing_date: data.guarantee_deposit_contract_providing_date,
      guarantee_deposit_actual_providing_date: data.guarantee_deposit_actual_providing_date,
      guarantee_bank_guarantee_expiration_date: data.guarantee_bank_guarantee_expiration_date,

      insurance_required: data.insurance_required,
      insurance_contract_providing_date: data.insurance_contract_providing_date,
      insurance_actual_providing_date: data.insurance_contract_providing_date,
      insurance_expiration_date: data.insurance_expiration_date,

      last_updated: data.last_updated,
      user_updated: data.user_updated,
    })

    if (this.form_contract.controls['turnover_fee_is_applicable'].value == true){
      this.turnoverFeeName.next( ' и % от ТО')
      this.turnoverFeeIsApplicable$.next(true)
    }
    if (this.form_contract.controls['turnover_fee_is_applicable'].value == false){
      this.turnoverFeeName.next( '')
      this.turnoverFeeIsApplicable$.next(false)
    }
    this.fixedRentNameSubject.next(this.form_contract.controls['fixed_rent_name'].value)
    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Month'){
      this.fixedRentCalculationPeriodSubject.next(' в месяц')
    }
    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Year'){
      this.fixedRentCalculationPeriodSubject.next(' в год')
    }
    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == true){
      this.caUtilitiesCompensationIsApplicable$.next(true)
    }
    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == false){
      this.caUtilitiesCompensationIsApplicable$.next(false)
    }
    if(this.form_contract.controls['guarantee_deposit_required'].value == true){
      this.guaranteeDepositIsRequired$.next(true)
    }
    if(this.form_contract.controls['guarantee_deposit_required'].value == false){
      this.guaranteeDepositIsRequired$.next(false)
    }
    if(this.form_contract.controls['insurance_required'].value == true){
      this.insuranceIsRequired$.next(true)
    }
    if(this.form_contract.controls['insurance_required'].value == false){
      this.insuranceIsRequired$.next(false)
    }

    //
    if (this.periodicalFeeContractArray.length > 0 && this.oneTimeFeeContractArray.length > 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('и единовременные ')
    }
    if (this.periodicalFeeContractArray.length == 0 && this.oneTimeFeeContractArray.length > 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('Единовременные ')
    }
    if (this.periodicalFeeContractArray.length > 0 && this.oneTimeFeeContractArray.length == 0){
      this.periodicalFeeNameSubject.next('Регулярные ')
      this.oneTimeFeeNameSubject.next('')
    }
    if (this.periodicalFeeContractArray.length == 0 && this.oneTimeFeeContractArray.length == 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('')
    }

    for(let fee of this.periodicalFeeContractArray){
      console.log(fee)
      this.populatePeriodicalFeeTab(fee)
    }
    for(let fee of this.oneTimeFeeContractArray){
      console.log(fee)
      this.populateOneTimeFeeTab(fee)
    }
    for(let fee of this.utilityFeeContractArray){
      console.log(fee)
      this.populateUtilityFeeTab(fee)
    }
    for(let fee of this.periodicalFeeContractArray){
      this.periodicalFeeAddSubscription(fee)
    }
    this.rentalContractAddSubscription()
    this.rentContractIsLoaded$.next(true)
    console.log(this.rentContractIsLoaded$.value)
  }

  rentalContractAddSubscription(){
    if (this.form_contract.controls['guarantee_deposit_type'].value == 'Cash'
      || this.form_contract.controls['guarantee_deposit_type'].value == 'Corporate_guarantee'){
      this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
      this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable()
    }
    this.guaranteeDepositTypeSubscription$ = this.form_contract.controls['guarantee_deposit_type'].valueChanges.subscribe(
      data => {
        if (data == 'Cash' || data == 'Corporate_guarantee'){
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable()
        }
        if (data == 'Bank_guarantee'){
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].enable()
        }
      }
    )
  }

  periodicalFeeAddSubscription(fee: RentalContractPeriodicalFeeModel){
    const i = this.periodicalFeeContractArray.indexOf(fee);

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
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable()
    }
    if (fee.periodical_fee_indexation_type == 'CPI'){
      this.periodicalFeeIndexationType.value[i] = 'CPI'
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
    }
    if (fee.periodical_fee_indexation_type == 'Non_Indexable'){
      this.periodicalFeeIndexationType.value[i] = 'Non_Indexable'
      this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
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
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable()
          } else {
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.setValue(null)
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
          console.log(data)
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

  oneTimeFeeAddSubscription(fee: RentalContractOneTimeFeeModel) {
    const i = this.oneTimeFeeContractArray.indexOf(fee);

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

    // @ts-ignore
    this.oneTimeFeePaymentSubscriptionArray[i] = this.oneTimeFeeTabs.controls[i].get('one_time_fee_payment_term')?.valueChanges.subscribe(
      data=>{
        console.log(data)
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
          console.log(data)
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


  dateDiff(startingDate: Date, endingDate: Date) {
    let startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    let endDate = new Date(endingDate);

    if (startDate > endDate) {
      let swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    let startYear = startDate.getFullYear();
    let february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    let daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
    return [yearDiff, monthDiff, dayDiff]
  }

  //Dynamically update existing Table row
  updateTableRow(data: RentalContractModel, premise: string[], tenant: string, brand: string) {
    let resultContract: RentalContractModelExpanded = {
      ...data,
      premise_number: premise,
      tenant_contractor_company_name: tenant,
      brand_name: brand
    }
    this.rowUpdate$.next(resultContract)
  }

  //Dynamically update existing Table row
  newTableRow(data: RentalContractModel, premise: string[], tenant: string, brand: string) {
    let resultContract: RentalContractModelExpanded = {
      ...data,
      premise_number: premise,
      tenant_contractor_company_name: tenant,
      brand_name: brand
    }
    this.rowCreate$.next(resultContract)
    }

  tableRowRetrieve(data: RentalContractModel){

    let resultData: RentalContractModelExpanded = {
      tenant_contractor_company_name: '',
      premise_number: [''],
      brand_name: '',
      ...data}
    console.log(resultData)
    const premiseNumbersArray$ = new Observable<string[]>(
      subscriber => {
        resultData.premise_number.splice(0,1)

        for (let premise_id of resultData.premise_id){
          this.apiService.getPremise(premise_id).subscribe(
            data => {
              resultData.premise_number.push(data.number)
              if (resultData.premise_number.length == resultData.premise_id.length){
                subscriber.next(resultData.premise_number)
                subscriber.complete()
              }
            }
          )
        }
      }
    )
    const companyName$ = new Observable<string>(
      subscriber => {
        if(resultData.tenant_contractor_id){
        this.apiService.getTenant(resultData.tenant_contractor_id).subscribe(
          data => {
            resultData.tenant_contractor_company_name = data.company_name
            subscriber.next(resultData.tenant_contractor_company_name)
            subscriber.complete()
          }
        )
      }}
    )
    const brand$ = new Observable<string>(
      subscriber => {
        if(resultData.brand){
        this.apiService.getBrand(resultData.brand).subscribe(
          data => {
            resultData.brand_name = data.brand_name
            subscriber.next(resultData.brand_name)
            subscriber.complete()
          }
        )
      }}
    )
    const addedData$: Observable<any> = forkJoin({
      premiseNumberArrays: premiseNumbersArray$,
      companyName: companyName$,
      brand: brand$
    })
    addedData$.subscribe(() => {
      return (resultData)
    })
  }

  //Chips add

  addPeriodicalFeeChip(event: MatChipInputEvent) {
    const feeName: string = (event.value || '').trim();
    const feeObject = {} as RentalContractPeriodicalFeeModel
    let i = 0
    for (let fee of this.periodicalFeeContractArray){
      if (feeName === fee.periodical_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.periodical_fee_name = feeName
      this.periodicalFeeContractArray.push(feeObject)
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
    for (let fee of this.oneTimeFeeContractArray){
      if (feeName === fee.one_time_fee_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.one_time_fee_name = feeName
      this.oneTimeFeeContractArray.push(feeObject)
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
    for (let fee of this.utilityFeeContractArray){
      if (feeName === fee.utility_name){
        i = 1
      }
    }
    if (feeName && i === 0) {
      feeObject.utility_name = feeName
      this.utilityFeeContractArray.push(feeObject)
      this.setNewUtilityFeeTab(feeObject.utility_name)
      console.log('New utility chip is added')
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  //Chips remove
  removePeriodicalFeeChip(fee: RentalContractPeriodicalFeeModel): void {
    const index = this.periodicalFeeContractArray.indexOf(fee);
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

      this.periodicalFeeContractArray.splice(index, 1);
      this.periodicalFeeTabs.removeAt(index)
      for (let sub of this.periodicalFeeIndexationSubscriptionArray){
        const sub_index = this.periodicalFeeIndexationSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.periodicalFeeAddSubscription(this.periodicalFeeContractArray[sub_index])
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
    const index = this.oneTimeFeeContractArray.indexOf(fee);
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
      this.oneTimeFeeContractArray.splice(index, 1);
      this.oneTimeFeeTabs.removeAt(index)
      for (let sub of this.oneTimeFeePaymentSubscriptionArray){
        const sub_index = this.oneTimeFeePaymentSubscriptionArray.indexOf(sub)
        if (sub_index >= index){
          this.oneTimeFeeAddSubscription(this.oneTimeFeeContractArray[sub_index])
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
    const index = this.utilityFeeContractArray.indexOf(fee);
    if (index >= 0) {
      this.utilityFeeContractArray.splice(index, 1);
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
    // @ts-ignore
    console.log(this.periodicalFeeTabs.controls[0].errors)
    console.log('New PeriodicalFee Tab is added')
    return this.periodicalFeeTabs
  }

  setNewOneTimeFeeTab(fee_name:string) {
    this.oneTimeFeeTabs.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
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
    console.log(this.oneTimeFeeTabs.controls[0].errors)
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
    console.log(this.utilityFeeTabs.controls[0].errors)
    console.log('New Utility Tab is added')
    return this.utilityFeeTabs
  }


  turnoverFeeIsApplicableChange($event: MatSlideToggleChange){
    this.turnoverFeeIsApplicable$.next($event.checked)
    if (this.turnoverFeeIsApplicable$.value){
      this.turnoverFeeName.next(' и % от ТО')
    }
    if (!this.turnoverFeeIsApplicable$.value){
      this.turnoverFeeName.next('')
    }

  }
  caUtilitiesCompensationIsApplicableChange($event: MatSlideToggleChange){
    this.caUtilitiesCompensationIsApplicable$.next($event.checked)
  }
  guaranteeDepositRequiredChange($event: MatSlideToggleChange){
    this.guaranteeDepositIsRequired$.next($event.checked)
  }
  insuranceRequiredChange($event: MatSlideToggleChange){
    this.insuranceIsRequired$.next($event.checked)
  }


}

import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest, distinctUntilChanged,
  forkJoin,
  Observable, pairwise, startWith,
  Subscription
} from "rxjs";
import {
  BrandModel,
  PremiseModel,
  RentalContractModel,
  RentalContractModelExpanded,
  TenantModel,
  RentalContractSetupModel,
  RentalContractPeriodicalFeeSetupModel,
  RentalContractOneTimeFeeSetupModel,
  RentalContractUtilityFeeSetupModel,
  RentalContractPeriodicalFeeModel,
  RentalContractOneTimeFeeModel,
  RentalContractUtilityFeeModel, DatesInterval,
} from "../../models/models";
import {AbstractControl, FormArray, FormBuilder, FormControl, ValidatorFn, Validators} from "@angular/forms";
import {ApiService} from "./api.service";
import {MatDialog} from "@angular/material/dialog";
import {EnumService} from "./enum.service";
import {RentalContractSetupService} from "./rental-contract-setup.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {GlobalAppService} from "./global-app.service";
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class RentalContractsService {

  public rentalContractsTableExpanded: RentalContractModelExpanded[] = [];

  // Variables for table dynamic update
  // @ts-ignore
  private rowCreate$ = new BehaviorSubject<RentalContractModelExpanded>([])
  newRow$ = this.rowCreate$.asObservable()
  // @ts-ignore
  private rowUpdate$ = new BehaviorSubject<RentalContractModelExpanded>([])
  updateRow$ = this.rowUpdate$.asObservable()

  // Form loaded trigger
  public rentContractListButtonsActivateTrigger$ = new BehaviorSubject<boolean>(false)
  public rentContractIsLoaded$ = new BehaviorSubject<boolean>(false)

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

  //Rent Contract Subscriptions
  public rentContractDateSubscription$: Subscription = new Subscription
  public rentContractDateSubscription_2$: Subscription = new Subscription
  public rentContractPremiseSubscription$: Subscription = new Subscription
  public rentContractTenantChangeSubscription$: Subscription = new Subscription;
  public rentContractBrandSelectSubscription$: Subscription = new Subscription;
  public rentContractPremiseAreaSummingSubscription$: Subscription = new Subscription;

  public defaultDateMin: Date = new Date(new Date().getFullYear()-50, 1, 1)
  public defaultDateMax: Date = new Date(new Date().getFullYear()+50, 1, 1)


  public rentContractSigningDate$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractSigningDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractSigningDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)

  public rentContractExpirationDate$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractExpirationDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)

  public rentContractActOfTransferDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractActOfTransferDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractRentStartDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractRentStartDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractPremiseReturnDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractPremiseReturnDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractStopBillingDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractStopBillingDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public insuranceProvidingDateDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public insuranceProvidingDateDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public insuranceExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public guaranteeDepositProvidingDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public guaranteeDepositProvidingDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public guaranteeBankGuaranteeExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public selectedGuaranteeDepositType = this.enumService.guaranteeDepositTypes[0].value



  // Rent Contract Setup settings
  public fixedRentNameSubject = new BehaviorSubject<string>('')
  public fixedRentCalculationPeriodSubject = new BehaviorSubject<string>('')
  public fixedRentCalculationObjectSubject = new BehaviorSubject<string>('???? 1 ????. ??.')
  public fixedRentPrePaymentOrPostPayment = new BehaviorSubject<string>('Prepayment')
  public turnoverFeeIsApplicable$ = new BehaviorSubject<boolean>(false)
  public turnoverFeeName = new BehaviorSubject<string>('')
  public caUtilitiesCompensationIsApplicable$ = new BehaviorSubject<boolean>(false)
  public caUtilitiesCompensation = new BehaviorSubject<string>('Proportional to GLA')
  public caUtilitiesCompensationFeePrepaymentOrPostpayment = new BehaviorSubject<string>('Prepayment')
  public insuranceIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositTypeSubscription$: Subscription = new Subscription()
  public guaranteeDepositType$ = new BehaviorSubject<string>('Cash')

  public guaranteeCoveredMonthsValue$: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public guaranteeCoveredDaysValue$: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public guaranteeDepositCoverageSubscription$: Subscription = new Subscription;

  // Validation variables
  public rentalContractNumbersArray = new BehaviorSubject<string[]>([])
  public premiseUsedArray = new BehaviorSubject<PremiseModel[]>([])
  public intervalPremiseUsedArray = new BehaviorSubject<DatesInterval[]>([])
  public intervalPremiseUsedArraySorted = new BehaviorSubject<DatesInterval[]>([])
  public intervalPremiseAllowedArray = new BehaviorSubject<DatesInterval[]>([])
  public intervalDatesValidationSubscription$: Subscription = new Subscription;

  public rentContractDatesInOneInterval$ = new BehaviorSubject<Boolean>(false)

  public rentContractFieldsDisablingSubscription: Subscription = new Subscription;

  public premises: PremiseModel[] = []
  public tenantContractors: TenantModel[] = []
  public brands: BrandModel[] = []
  public selectedTenantBrands: BrandModel[] = []
  public contractSetup: RentalContractSetupModel[] = []

  public periodicalFeeSetupArray = new BehaviorSubject<RentalContractPeriodicalFeeSetupModel[]>([]) //PeriodicalFee setup array
  public periodicalFeeContractArray = new BehaviorSubject<RentalContractPeriodicalFeeModel[]>([])// PeriodicalFee array
  public oneTimeFeeSetupArray = new BehaviorSubject<RentalContractOneTimeFeeSetupModel[]>([]) //OneTimeFee array
  public oneTimeFeeContractArray = new BehaviorSubject<RentalContractOneTimeFeeModel[]>([])  //OneTimeFee array
  public utilityFeeSetupArray = new BehaviorSubject<RentalContractUtilityFeeSetupModel[]>([]) //UtilityFee array
  public utilityFeeContractArray = new BehaviorSubject<RentalContractUtilityFeeModel[]>([]) //UtilityFee array

  public selectedPremise: string[] = []
  public selectedPremiseArea: number[] = []
  public selectedTenant = ''
  public selectedBrand = ''
  public contract: RentalContractModelExpanded = {
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

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public setupService: RentalContractSetupService,
    public enumService: EnumService,
    public modalContactDeleteDialog: MatDialog,
    public datepipe: DatePipe)
  {}

  // Contract form declare
  public form_contract = this.fb.group({
    id: [''],
    rent_contract_number: ['', [Validators.required, this.inputRentalContractNumber()]],
    rent_contract_signing_date: ['', [Validators.required]],
    rent_contract_expiration_date: ['', [Validators.required]],
    building_id: [''],
    premise_id: ['', Validators.required],
    contracted_area: ['', [Validators.required, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")]],
    tenant_contractor_id: ['', Validators.required],
    brand: ['', Validators.required],
    act_of_transfer_date: [''],
    rent_start_date: [''],
    premise_return_date: [''],
    stop_billing_date: [''],
    fixed_rent_name: [''],
    fixed_rent_calculation_period: [''],
    fixed_rent_payment_period: [''],
    fixed_rent_calculation_method: [''],
    fixed_rent_per_sqm: ['', Validators.pattern("^[0-9]{1,12}(\.[0-9]{1,2})?$")],
    fixed_rent_total_payment: ['', Validators.pattern("^[0-9]{1,12}(\.[0-9]{1,2})?$")],
    fixed_rent_prepayment_or_postpayment: [''],
    fixed_rent_advance_payment_day: ['',Validators.pattern("^[0-9]{1,2}")],
    fixed_rent_post_payment_day: ['', Validators.pattern("^[0-9]{1,2}")],
    fixed_rent_indexation_type: [''],
    fixed_rent_indexation_fixed: ['', Validators.pattern("^[0-9]{1,2}(\.[0-9]{1,2})?$")],
    turnover_fee_is_applicable: true,
    turnover_fee: ['', Validators.pattern("^[0-9]{1,2}(\.[0-9]{1,2})?$")],
    turnover_fee_period: [''],
    turnover_data_providing_day: ['', Validators.pattern("^[0-9]{1,2}")],
    turnover_fee_payment_day: ['', Validators.pattern("^[0-9]{1,2}")],
    CA_utilities_compensation_is_applicable: true,
    CA_utilities_compensation_type: [''],
    CA_utilities_compensation_fixed_indexation_type: [''],
    CA_utilities_compensation_fee_fixed: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    CA_utilities_compensation_fee_fixed_indexation_type_fixed: ['', Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")],
    CA_utilities_compensation_fee_prepayment_or_postpayment: [''],
    CA_utilities_compensation_fee_advance_payment_day: ['', Validators.pattern("^[0-9]{1,2}")],
    CA_utilities_compensation_fee_post_payment_day: ['', Validators.pattern("^[0-9]{1,2}")],
    guarantee_deposit_required: true,
    guarantee_deposit_coverage_number_of_periods: [''],
    guarantee_deposit_type: [''],
    guarantee_deposit_amount: ['', Validators.pattern("^[0-9]{1,15}(\.[0-9]{1,2})?$")],
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

  // Populate form with brand names
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
              }}}}}}}

  //New Contract
  initializeNewRentalContractCard(){
    this.globalService.editCardTrigger$.next(true)

    for (let contract of this.rentalContractsTableExpanded){
      this.rentalContractNumbersArray.value.push(contract.rent_contract_number)}

    this.rentalContractAddPreSubscription()

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
      guarantee_deposit_type: 'Cash',
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

    // Initial settings
    this.rentalContractInitialSettings()

    // Post subscription
    this.rentalContractAddPostSubscription()

    // Create new fee arrays
    for(let fee of this.periodicalFeeSetupArray.value){
      this.newPeriodicalFeeContractArray(fee)
    }
    for(let fee of this.oneTimeFeeSetupArray.value){
      this.newOneTimeFeeContractArray(fee)
    }
    for(let fee of this.utilityFeeSetupArray.value){
      this.newUtilityFeeContractArray(fee)
    }

    // Populate fee tabs from fee arrays and add subscriptions
    for(let fee of this.periodicalFeeContractArray.value){
      this.populatePeriodicalFeeTab(fee)
      this.periodicalFeeAddSubscription(fee)
    }
    for(let fee of this.oneTimeFeeContractArray.value){
      this.populateOneTimeFeeTab(fee)
      this.oneTimeFeeAddSubscription(fee)
    }
    for(let fee of this.utilityFeeContractArray.value){
      this.populateUtilityFeeTab(fee)
    }

    this.rentContractIsLoaded$.next(true)
    console.log('New rental contract card is initialized')
  }

  populateRentalContractCard(data: RentalContractModelExpanded) {
    this.globalService.editCardTrigger$.next(true)

    this.rentalContractAddPreSubscription()

    for (let contract of this.rentalContractsTableExpanded){
      this.rentalContractNumbersArray.value.push(contract.rent_contract_number)}

    const index = this.rentalContractNumbersArray.value.indexOf(data.rent_contract_number, 0);
    if (index > -1) {
      this.rentalContractNumbersArray.value.splice(index, 1)}

    this.form_contract.setValue({
      id: data.id,
      rent_contract_number: data.rent_contract_number,
      rent_contract_signing_date: new Date(data.rent_contract_signing_date),
      rent_contract_expiration_date: new Date(data.rent_contract_expiration_date),
      building_id: data.building_id,
      premise_id: data.premise_id,
      contracted_area: data.contracted_area,
      tenant_contractor_id: data.tenant_contractor_id,
      brand: data.brand,
      act_of_transfer_date: new Date(data.act_of_transfer_date),
      rent_start_date: new Date(data.rent_start_date),
      premise_return_date: new Date(data.premise_return_date),
      stop_billing_date: new Date(data.stop_billing_date),

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
    // this.selectedPremise = data.premise_number
    // this.selectedTenant = data.tenant_contractor_company_name
    // this.selectedBrand = data.brand_name

    // Initial settings
    this.rentalContractInitialSettings()

    // Post subscription
    this.rentalContractAddPostSubscription()

    for(let fee of this.periodicalFeeContractArray.value){
      this.populatePeriodicalFeeTab(fee)
    }
    for(let fee of this.oneTimeFeeContractArray.value){
      this.populateOneTimeFeeTab(fee)
    }
    for(let fee of this.utilityFeeContractArray.value){
      this.populateUtilityFeeTab(fee)
    }
    for(let fee of this.periodicalFeeContractArray.value){
      this.periodicalFeeAddSubscription(fee)
    }
    this.setFeeNames()
    this.rentContractIsLoaded$.next(true)
    console.log('Rent contract is loaded')
  }

  //New Periodical/One Time/Utility fee Arrays

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

  // Populate Rental Contract
  rentalContractInitialSettings(){

    if(this.form_contract.controls['premise_id'].value.length == 0){
      this.rentContractDatesFormLimitsReset()
    }

    this.fixedRentNameSubject.next(this.form_contract.controls['fixed_rent_name'].value)

    if (this.form_contract.controls['turnover_fee_is_applicable'].value == true){
      this.turnoverFeeName.next( ' ?? % ???? ????')
      this.turnoverFeeIsApplicable$.next(true)}

    if (this.form_contract.controls['turnover_fee_is_applicable'].value == false){
      this.turnoverFeeName.next( '')
      this.turnoverFeeIsApplicable$.next(false)}

    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Month'){
      this.fixedRentCalculationPeriodSubject.next(' ?? ??????????')}

    if (this.form_contract.controls['fixed_rent_calculation_period'].value == 'Year'){
      this.fixedRentCalculationPeriodSubject.next(' ?? ??????')}

    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == true){
      this.caUtilitiesCompensationIsApplicable$.next(true)}

    if(this.form_contract.controls['CA_utilities_compensation_is_applicable'].value == false){
      this.caUtilitiesCompensationIsApplicable$.next(false)}

    if(this.form_contract.controls['guarantee_deposit_required'].value == true){
      this.guaranteeDepositIsRequired$.next(true)
      this.form_contract.controls['guarantee_deposit_type'].setValue(this.selectedGuaranteeDepositType)}

    if(this.form_contract.controls['guarantee_deposit_required'].value == false){
      this.guaranteeDepositIsRequired$.next(false)}

    if(this.form_contract.controls['insurance_required'].value == true){
      this.insuranceIsRequired$.next(true)
    }
    if(this.form_contract.controls['insurance_required'].value == false){
      this.insuranceIsRequired$.next(false)
    }

    if(this.form_contract.controls['rent_contract_signing_date'].value == ''
      || this.form_contract.controls['rent_contract_expiration_date'].value == ''
    ){
      this.rentContractDatesInOneInterval$.next(false)
    }
  }

  rentalContractAddPreSubscription(){
    console.log('Rent Contract Subscription added')

    // Premise id subscription
    this.rentContractPremiseSubscription$ =
      this.form_contract.controls['premise_id'].valueChanges
        .pipe(
          startWith(null), pairwise())
        .subscribe(data => {
          if (data[0] != null && data[1].length != data[0].length) {
            console.log('Premise is NOT set')
            this.form_contract.controls['rent_contract_signing_date'].reset()
            this.form_contract.controls['rent_contract_expiration_date'].reset()
            this.rentContractDatesFormReset()
            this.rentContractDatesFormLimitsReset()

          }
          if (data[1].length != 0)
          {
            console.log('Premise is set', data[1])
              this.populateIntervalPremiseAllowedArray(data[1])
              this.selectedPremiseArea = []
              this.selectedPremise = []
              this.form_contract.controls['contracted_area'].setValue('')
              for (let id of data[1]) {
                for (let premise of this.premises) {
                  if (premise.id === id) {
                    this.selectedPremiseArea.push(premise.measured_area)
                    this.selectedPremise.push(premise.number)
                    this.form_contract.controls['contracted_area'].setValue(this.areaSumming(this.selectedPremiseArea))
                  }
                }
            }
          }
        })

    // Tenant change subscription
    this.rentContractTenantChangeSubscription$ =
      this.form_contract.controls['tenant_contractor_id'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(
      data => {
        for (let tenant of this.tenantContractors){
          if (tenant.id == data){
            this.selectedTenant = tenant.company_name
            console.log('Tenant is set to ', this.selectedTenant)
          }}
        this.getSelectedBrands(data)
      })

    // Brand change subscription
    this.rentContractBrandSelectSubscription$ =
      this.form_contract.controls['brand'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(
      data=>{
        for (let brand of this.selectedTenantBrands){
          if(brand.id == data){
            this.selectedBrand = brand.brand_name
            console.log('Brand is set to ', this.selectedBrand)
          }}})

    // Signing and expiration dates change subscription
      this.rentContractDateSubscription$ = combineLatest([
      this.form_contract.controls['rent_contract_signing_date'].valueChanges,
      this.form_contract.controls['rent_contract_expiration_date'].valueChanges
      ]).pipe(
        distinctUntilChanged(),
        startWith([this.defaultDateMin, this.defaultDateMax]),
        pairwise()
      )
        .subscribe(data => {
          console.log(data)
        // Change date
          if(data[1][0] != null
            && data[1][0] != ''
            && data[1][0] != data[0][0])
        {
          console.log('Rental contract signing date is set to ', data[1][0])
          this.rentContractSigningDate$.next(data[1][0])
          this.rentContractExpirationDateMin$.next(data[1][0])
          this.rentContractActOfTransferDateMin$.next(data[1][0])
          this.rentContractPremiseReturnDateMin$.next(data[1][0])
          this.rentContractRentStartDateMin$.next(data[1][0])
          this.rentContractStopBillingDateMin$.next(data[1][0])

          this.insuranceProvidingDateDateMin$.next(data[1][0])
          this.insuranceExpirationDateMin$.next(data[1][0])
          this.guaranteeDepositProvidingDateMin$.next(data[1][0])
          this.guaranteeBankGuaranteeExpirationDateMin$.next(data[1][0])
        }

        if(data[1][1] != null
          && data[1][1] != ''
          && data[1][1] != data[0][1])
        {
          console.log('Rental contract expiration date is set to ', data[1][1])
          this.rentContractExpirationDate$.next(data[1][1])
          this.rentContractSigningDateMax$.next(data[1][1])
          this.rentContractActOfTransferDateMax$.next(data[1][1])
          this.rentContractPremiseReturnDateMax$.next(data[1][1])
          this.rentContractRentStartDateMax$.next(data[1][1])
          this.rentContractStopBillingDateMax$.next(data[1][1])

          this.insuranceProvidingDateDateMax$.next(data[1][1])
          this.guaranteeDepositProvidingDateMax$.next(data[1][1])
            }
        if (data[1][0] == null
          || data[1][1] == null
        ){ this.rentContractDatesInOneInterval$.next(false)
          console.log(this.rentContractDatesInOneInterval$.value)
        }
          }
    )

      // this.rentContractDateSubscription_2$ = combineLatest([
      //   this.form_contract.controls['act_of_transfer_date'].valueChanges,
      //   this.form_contract.controls['rent_start_date'].valueChanges,
      //   this.form_contract.controls['stop_billing_date'].valueChanges,
      //   this.form_contract.controls['premise_return_date'].valueChanges,
      // ]).pipe(distinctUntilChanged())
      //   .subscribe( data => {
      //     if(data[0]){
      //       console.log('Act of transfer date is set to ', data[0])
      //       this.rentContractSigningDateMax$.next(new Date(data[0].getTime()-(1000 * 60 * 60 * 3)))
      //       this.rentContractRentStartDateMin$.next(new Date(data[0].getTime()-(1000 * 60 * 60 * 3)))
      //     if(!data[1] && !data[2] && !data[3]){this.rentContractExpirationDateMin$.next(new Date(data[0].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[1] && !data[2]){this.rentContractPremiseReturnDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[1] && data[2]){this.rentContractPremiseReturnDateMin$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[1] && !data[2]){this.rentContractPremiseReturnDateMin$.next(new Date(data[0].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[1]){this.rentContractStopBillingDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[1]){this.rentContractStopBillingDateMin$.next(new Date(data[0].getTime()-(1000 * 60 * 60 * 3)))}
      //   }
      //   if(data[1]){
      //     console.log('Rent start date is set to ', data[1])
      //     this.rentContractActOfTransferDateMax$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))
      //     this.rentContractStopBillingDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))
      //     if(!data[0]){this.rentContractSigningDateMax$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[2] && !data[3]){this.rentContractExpirationDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[2]){this.rentContractPremiseReturnDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[2]){this.rentContractPremiseReturnDateMin$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //   }
      //   if(data[2]){
      //     console.log('Stop billing date is set to ', data[2])
      //     this.rentContractRentStartDateMax$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))
      //     this.rentContractPremiseReturnDateMin$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))
      //     if(!data[0] && !data[1]){this.rentContractSigningDateMax$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[3]){this.rentContractExpirationDateMin$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[1]){this.rentContractActOfTransferDateMax$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[1]){this.rentContractActOfTransferDateMax$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //   }
      //   if(data[3]){
      //     console.log('Premise return date is set to ', data[3])
      //     this.rentContractStopBillingDateMax$.next(new Date(data[3].getTime()-(1000 * 60 * 60 * 3)))
      //     this.rentContractExpirationDateMin$.next(new Date(data[3].getTime()-(1000 * 60 * 60 * 3)))
      //     if(!data[0] && !data[1] && !data[2]){this.rentContractSigningDateMax$.next(new Date(data[3].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[2] && !data[1]){this.rentContractActOfTransferDateMax$.next(new Date(data[3].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[2] && data[1]){this.rentContractActOfTransferDateMax$.next(new Date(data[1].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[2] && !data[1]){this.rentContractActOfTransferDateMax$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(data[2]){this.rentContractRentStartDateMax$.next(new Date(data[2].getTime()-(1000 * 60 * 60 * 3)))}
      //     if(!data[2]){this.rentContractRentStartDateMax$.next(new Date(data[3].getTime()-(1000 * 60 * 60 * 3)))}
      //   }
      // }
      // )

    this.guaranteeDepositTypeSubscription$ = this.form_contract.controls['guarantee_deposit_type'].valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(
      data => {
        console.log('Deposit type is set to ', data)
        this.guaranteeDepositType$.next(data)
      })

    // Guarantee deposit coverage subscription
    this.guaranteeDepositCoverageSubscription$ = combineLatest([
      this.form_contract.controls['contracted_area'].valueChanges,
      this.form_contract.controls['fixed_rent_per_sqm'].valueChanges,
      this.form_contract.controls['fixed_rent_total_payment'].valueChanges,
      this.form_contract.controls['fixed_rent_calculation_period'].valueChanges,
      this.form_contract.controls['guarantee_deposit_amount'].valueChanges,
      this.fixedRentCalculationObjectSubject
    ]).pipe(distinctUntilChanged())
      .subscribe( data=>{
      this.depositCoverageCalculation(
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
      )
    })

  }

  rentalContractAddPostSubscription(){
    console.log('Rental contract post subscription added')

    this.intervalDatesValidationSubscription$ = combineLatest([
      this.intervalPremiseAllowedArray,
      this.rentContractSigningDate$,
      this.rentContractExpirationDate$
    ]).pipe(
      distinctUntilChanged(),
      startWith([[], this.defaultDateMin, this.defaultDateMax]),
      pairwise()
    )
      .subscribe(data=> {
        this.rentContractDatesInOneInterval$.next(false)
          // @ts-ignore
        if (data[1][0].length > 0
            && data[1][1] != this.defaultDateMin
            && data[1][2] != this.defaultDateMax
          ) {
            let i = 0
            // @ts-ignore
          for (let interval of data[1][0]) {
              if (data[1][1] >= interval.startDate
                && data[1][1] <= interval.expirationDate
                && data[1][2] >= interval.startDate
                && data[1][2] <= interval.expirationDate)
              {i = i + 1}}
            if (i >0 ) {
              console.log('Signing and Expiration dates are in one interval')
              this.rentContractDatesInOneInterval$.next(true)
            } else {
              console.log('Signing and Expiration dates are NOT in one interval')
              this.rentContractDatesInOneInterval$.next(false)
              this.rentContractDatesFormReset()
            }
          }
        }
      )
  }


  // Reset Rental contract fees
  rentContractReset(){

    this.premises = []
    this.tenantContractors = []
    this.brands = []
    this.selectedTenantBrands = []
    this.rentalContractNumbersArray.next([])

    this.periodicalFeeContractArray.next([])
    this.oneTimeFeeContractArray.next([])
    this.utilityFeeContractArray.next([])

    this.periodicalFeeTabs.clear()
    this.oneTimeFeeTabs.clear()
    this.utilityFeeTabs.clear()

    this.form_contract.reset()
    this.periodicalFeeTabs.reset()
    this.oneTimeFeeTabsForm.reset()
    this.utilityFeeTabsForm.reset()
  }

  // Reset Rental contract fees
  rentContractDatesFormLimitsReset(){
    console.log('Dates limits reset')
    this.rentContractSigningDate$.next(this.defaultDateMin)
    this.rentContractExpirationDate$.next(this.defaultDateMin)
    this.rentContractSigningDateMin$.next(this.defaultDateMin)
    this.rentContractSigningDateMax$.next(this.defaultDateMax)
    this.rentContractExpirationDateMin$.next(this.defaultDateMin)
    this.rentContractExpirationDateMax$.next(this.defaultDateMax)
    this.rentContractActOfTransferDateMin$.next(this.defaultDateMin)
    this.rentContractActOfTransferDateMax$.next(this.defaultDateMax)
    this.rentContractPremiseReturnDateMin$.next(this.defaultDateMin)
    this.rentContractPremiseReturnDateMax$.next(this.defaultDateMax)
    this.rentContractRentStartDateMin$.next(this.defaultDateMin)
    this.rentContractRentStartDateMax$.next(this.defaultDateMax)
    this.rentContractStopBillingDateMin$.next(this.defaultDateMin)
    this.rentContractStopBillingDateMax$.next(this.defaultDateMax)
    this.insuranceProvidingDateDateMin$.next(this.defaultDateMin)
    this.insuranceExpirationDateMin$.next(this.defaultDateMin)
    this.guaranteeDepositProvidingDateMin$.next(this.defaultDateMin)
    this.guaranteeBankGuaranteeExpirationDateMin$.next(this.defaultDateMin)
    this.insuranceProvidingDateDateMax$.next(this.defaultDateMax)
    this.guaranteeDepositProvidingDateMax$.next(this.defaultDateMax)
  }

  rentContractDatesFormReset(){
    console.log('Date forms are reset')
    this.form_contract.controls['act_of_transfer_date'].reset()
    this.form_contract.controls['premise_return_date'].reset()
    this.form_contract.controls['rent_start_date'].reset()
    this.form_contract.controls['stop_billing_date'].reset()
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].reset()
    this.form_contract.controls['guarantee_deposit_actual_providing_date'].reset()
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
    this.form_contract.controls['insurance_contract_providing_date'].reset()
    this.form_contract.controls['insurance_actual_providing_date'].reset()
    this.form_contract.controls['insurance_expiration_date'].reset()
  }

  rentContractDatesEnable(){
    console.log('Date forms are enabled')
    this.form_contract.controls['act_of_transfer_date'].enable()
    this.form_contract.controls['premise_return_date'].enable()
    this.form_contract.controls['rent_start_date'].enable()
    this.form_contract.controls['stop_billing_date'].enable()
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].enable()
    this.form_contract.controls['guarantee_deposit_actual_providing_date'].enable()
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].enable()
    this.form_contract.controls['insurance_contract_providing_date'].enable()
    this.form_contract.controls['insurance_actual_providing_date'].enable()
    this.form_contract.controls['insurance_expiration_date'].enable()
  }

  rentContractDatesDisable(){
    console.log('Date forms are disabled')
    this.form_contract.controls['act_of_transfer_date'].disable()
    this.form_contract.controls['premise_return_date'].disable()
    this.form_contract.controls['rent_start_date'].disable()
    this.form_contract.controls['stop_billing_date'].disable()
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].disable()
    this.form_contract.controls['guarantee_deposit_actual_providing_date'].disable()
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable()
    this.form_contract.controls['insurance_contract_providing_date'].disable()
    this.form_contract.controls['insurance_actual_providing_date'].disable()
    this.form_contract.controls['insurance_expiration_date'].disable()
  }

  setFeeNames(){
    if (this.periodicalFeeContractArray.value.length > 0 && this.oneTimeFeeContractArray.value.length > 0){
      this.periodicalFeeNameSubject.next('???????????????????? ')
      this.oneTimeFeeNameSubject.next('?? ???????????????????????????? ')
    }
    if (this.periodicalFeeContractArray.value.length == 0 && this.oneTimeFeeContractArray.value.length > 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('???????????????????????????? ')
    }
    if (this.periodicalFeeContractArray.value.length > 0 && this.oneTimeFeeContractArray.value.length == 0){
      this.periodicalFeeNameSubject.next('???????????????????? ')
      this.oneTimeFeeNameSubject.next('')
    }
    if (this.periodicalFeeContractArray.value.length == 0 && this.oneTimeFeeContractArray.value.length == 0){
      this.periodicalFeeNameSubject.next('')
      this.oneTimeFeeNameSubject.next('')
    }
  }

  populateIntervalPremiseAllowedArray(premise_IdsArray: number[]){
    console.log('Allowed Array calculation started')

    this.intervalPremiseUsedArray.next([])
    this.intervalPremiseUsedArraySorted.next([])
    this.intervalPremiseAllowedArray.next([])

    if(this.form_contract.controls['id'].value){
      console.log('Existing contract intervals', this.form_contract.controls['id'].value)
      for (let contract of this.rentalContractsTableExpanded) {
        let premiseIntersectArray = contract.premise_id.filter(value => premise_IdsArray.includes(value))
        if (premiseIntersectArray.length > 0 && this.form_contract.controls['id'].value != contract.id) {
          this.intervalPremiseUsedArray.value.push({
            startDate: new Date(contract.rent_contract_signing_date),
            expirationDate: new Date(contract.rent_contract_expiration_date)
          })}
      }}

    if(!this.form_contract.controls['id'].value){
      console.log('New contract intervals')
      for (let contract of this.rentalContractsTableExpanded) {
        let premiseIntersectArray = contract.premise_id.filter(value => premise_IdsArray.includes(value))
        if (premiseIntersectArray.length > 0) {
          this.intervalPremiseUsedArray.value.push({
            startDate: new Date(contract.rent_contract_signing_date),
            expirationDate: new Date(contract.rent_contract_expiration_date)
          })
        }
      }
    }


    this.intervalPremiseUsedArray.value.forEach((value) =>{
      value.startDate.setTime(value.startDate.getTime() - (1000 * 60 * 60 * 3))
      value.expirationDate.setTime(value.expirationDate.getTime() - (1000 * 60 * 60 * 3))
    })

    this.intervalPremiseUsedArraySorted.next(this.intervalPremiseUsedArray.value.sort
    (function (a,b){
      return a.startDate.getTime() < b.startDate.getTime() ? -1
        : a.startDate.getTime() > b.startDate.getTime() ? 1
          : 0
    }))

    let intervalPremiseAllowedArrayTemp = []

    if (this.intervalPremiseUsedArraySorted.value.length > 0)
    {
      let startDate = this.intervalPremiseUsedArraySorted.value[0].startDate
      intervalPremiseAllowedArrayTemp[0] = {
        startDate: new Date(new Date().getFullYear()-50,1,1),
        expirationDate:
          new Date (startDate.getTime() - (1000 * 60 * 60 * 24))
      }

      this.intervalPremiseUsedArraySorted.value.forEach((value, index) =>
      {
        if (index > 0) {
          let startDate = this.intervalPremiseUsedArraySorted.value[index].startDate
          let expirationDate = this.intervalPremiseUsedArraySorted.value[index - 1].expirationDate
          intervalPremiseAllowedArrayTemp[index] = {
            startDate: new Date(expirationDate.getTime() + (1000 * 60 * 60 * 24)) ,
            expirationDate: new Date(startDate.getTime() - (1000 * 60 * 60 * 24))
          }
        }
      })

      let expirationDate =
        this.intervalPremiseUsedArraySorted.value[this.intervalPremiseUsedArraySorted.value.length - 1].expirationDate

      intervalPremiseAllowedArrayTemp[this.intervalPremiseUsedArraySorted.value.length] = {
        startDate: new Date(expirationDate.getTime() + (1000 * 60 * 60 * 24)) ,
        expirationDate: (new Date(new Date().getFullYear()+50,1,1))
      }
    }
    if (intervalPremiseAllowedArrayTemp.length == 0){
      intervalPremiseAllowedArrayTemp[0] = {
        startDate: this.defaultDateMin,
        expirationDate: this.defaultDateMax
      }
    }
    this.intervalPremiseAllowedArray.next(intervalPremiseAllowedArrayTemp)
    console.log('Allowed intervals are calculated', this.intervalPremiseAllowedArray.value)
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
      this.periodicalFeeCalculationPeriod.value[i] = ' ?? ??????????'
    } if (fee.periodical_fee_calculation_period == 'Year'){
      this.periodicalFeeCalculationPeriod.value[i] = ' ??????'
    }

    // @ts-ignore
    this.periodicalFeeIndexationSubscriptionArray[i] =
      this.periodicalFeeTabs.controls[i].get('periodical_fee_indexation_type')?.valueChanges.subscribe(
        data=> {
          if(data == 'Fixed'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.enable()
            this.periodicalFeeIndexationType.value[i] = 'Fixed'
          }
          if(data == 'CPI'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.setValue(null)
            this.periodicalFeeIndexationType.value[i] = 'CPI'
          }
          if(data == 'Non_Indexable'){
            this.periodicalFeeTabs.controls[i].get('periodical_payment_indexation_fixed')?.disable()
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
            this.periodicalFeeCalculationPeriod.value[i] = ' ?? ??????????'
          }
          if (data == 'Year'){
            this.periodicalFeeCalculationPeriod.value[i] = ' ?? ??????'
          }
        }
      )
  }

  oneTimeFeeAddSubscription(fee: RentalContractOneTimeFeeModel) {
    const i = this.oneTimeFeeContractArray.value.indexOf(fee);

    if (fee.one_time_fee_calculation_method == 'Month'){
      this.oneTimeFeeCalculationPeriod.value[i] = ' ?? ??????????'
    } if (fee.one_time_fee_calculation_method == 'Year'){
      this.oneTimeFeeCalculationPeriod.value[i] = ' ??????'
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
      this.oneTimeFeeTriggeringEvent.value[i] = '???????? ????????????????'
    }
    if (fee.one_time_fee_payment_triggering_event == 'Premise_transfer_date'){
      this.oneTimeFeeTriggeringEvent.value[i] = '???????? ???????????????? ?????????????????? ????????????????????'
    }
    if (fee.one_time_fee_payment_triggering_event == 'Start_of_commercial_activity'){
      this.oneTimeFeeTriggeringEvent.value[i] = '???????? ???????????? ???????????????????????? ????????????????????????'
    }

    // @ts-ignore
    this.oneTimeFeeTriggeringEventSubscriptionArray[i] = this.oneTimeFeeTabs.controls[i]
      .get('one_time_fee_payment_triggering_event')?.valueChanges.subscribe(
        data=> {
          if (data){
            if (data == 'Contract_signing_date'){
              this.oneTimeFeeTriggeringEvent.value[i] = '???????? ????????????????'
            }
            if (data == 'Premise_transfer_date'){
              this.oneTimeFeeTriggeringEvent.value[i] = '???????? ???????????????? ?????????????????? ????????????????????'
            }
            if (data == 'Start_of_commercial_activity'){
              this.oneTimeFeeTriggeringEvent.value[i] = '???????? ???????????? ???????????????????????? ????????????????????????'
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

  // dateDiff(startingDate: Date, endingDate: Date) {
  //   let startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
  //   let endDate = new Date(endingDate);
  //
  //   if (startDate > endDate) {
  //     let swap = startDate;
  //     startDate = endDate;
  //     endDate = swap;
  //   }
  //   startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
  //   let startYear = startDate.getFullYear();
  //   let february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
  //   let daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  //
  //   let yearDiff = endDate.getFullYear() - startYear;
  //   let monthDiff = endDate.getMonth() - startDate.getMonth();
  //   if (monthDiff < 0) {
  //     yearDiff--;
  //     monthDiff += 12;
  //   }
  //   let dayDiff = endDate.getDate() - startDate.getDate();
  //   if (dayDiff < 0) {
  //     if (monthDiff > 0) {
  //       monthDiff--;
  //     } else {
  //       yearDiff--;
  //       monthDiff = 11;
  //     }
  //     dayDiff += daysInMonth[startDate.getMonth()];
  //   }
  //   return [yearDiff, monthDiff, dayDiff]
  // }

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

  // tableRowRetrieve(data: RentalContractModel){
  //
  //   let resultData: RentalContractModelExpanded = {
  //     tenant_contractor_company_name: '',
  //     premise_number: [''],
  //     brand_name: '',
  //     ...data}
  //   console.log(resultData)
  //   const premiseNumbersArray$ = new Observable<string[]>(
  //     subscriber => {
  //       resultData.premise_number.splice(0,1)
  //
  //       for (let premise_id of resultData.premise_id){
  //         this.apiService.getPremise(premise_id).subscribe(
  //           data => {
  //             resultData.premise_number.push(data.number)
  //             if (resultData.premise_number.length == resultData.premise_id.length){
  //               subscriber.next(resultData.premise_number)
  //               subscriber.complete()
  //             }
  //           }
  //         )
  //       }
  //     }
  //   )
  //   const companyName$ = new Observable<string>(
  //     subscriber => {
  //       if(resultData.tenant_contractor_id){
  //       this.apiService.getTenant(resultData.tenant_contractor_id).subscribe(
  //         data => {
  //           resultData.tenant_contractor_company_name = data.company_name
  //           subscriber.next(resultData.tenant_contractor_company_name)
  //           subscriber.complete()
  //         }
  //       )
  //     }}
  //   )
  //   const brand$ = new Observable<string>(
  //     subscriber => {
  //       if(resultData.brand){
  //       this.apiService.getBrand(resultData.brand).subscribe(
  //         data => {
  //           resultData.brand_name = data.brand_name
  //           subscriber.next(resultData.brand_name)
  //           subscriber.complete()
  //         }
  //       )
  //     }}
  //   )
  //   const addedData$: Observable<any> = forkJoin({
  //     premiseNumberArrays: premiseNumbersArray$,
  //     companyName: companyName$,
  //     brand: brand$
  //   })
  //   addedData$.subscribe(() => {
  //     return (resultData)
  //   })
  // }

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

  turnoverFeeIsApplicableChange($event: MatSlideToggleChange){
    this.turnoverFeeIsApplicable$.next($event.checked)
    if (this.turnoverFeeIsApplicable$.value){
      this.turnoverFeeName.next(' ?? % ???? ????')
    }
    if (!this.turnoverFeeIsApplicable$.value){
      this.turnoverFeeName.next('')
    }

  }
  caUtilitiesCompensationIsApplicableChange($event: MatSlideToggleChange){
    this.caUtilitiesCompensationIsApplicable$.next($event.checked)}
  guaranteeDepositRequiredChange($event: MatSlideToggleChange){
    this.guaranteeDepositIsRequired$.next($event.checked)
  }
  insuranceRequiredChange($event: MatSlideToggleChange){
    this.insuranceIsRequired$.next($event.checked)
  }

  depositCoverageCalculation(
    contracted_area: number,
    fixed_rent_per_sqm: number,
    fixed_rent_total_payment: number,
    fixed_rent_calculation_period: string,
    guarantee_deposit_amount: number,
    fixed_rent_calculation_method: string){
    if (fixed_rent_calculation_method == 'Per_sqm'){
      this.form_contract.controls['fixed_rent_total_payment'].reset()
      fixed_rent_total_payment = 0
    }
    if (fixed_rent_calculation_method == 'Total'){
      this.form_contract.controls['fixed_rent_per_sqm'].reset()
      fixed_rent_per_sqm = 0
    }
    if (fixed_rent_calculation_period == 'Month'){
      if(fixed_rent_per_sqm){
        this.guaranteeCoveredMonthsValue$.next(Math.trunc(guarantee_deposit_amount/(fixed_rent_per_sqm*contracted_area)))
        this.guaranteeCoveredDaysValue$.next(
          Math.trunc(((guarantee_deposit_amount/(fixed_rent_per_sqm*contracted_area))-
            Math.trunc(guarantee_deposit_amount/(fixed_rent_per_sqm*contracted_area)))*30)
        )
      }
      if(fixed_rent_total_payment){
        this.guaranteeCoveredMonthsValue$.next(Math.trunc(guarantee_deposit_amount/(fixed_rent_total_payment)))
        this.guaranteeCoveredDaysValue$.next(
          Math.trunc(((guarantee_deposit_amount/(fixed_rent_total_payment))-
            Math.trunc(guarantee_deposit_amount/(fixed_rent_total_payment)))*30)
        )
      }
    }
    if (fixed_rent_calculation_period == 'Year'){
      if(fixed_rent_per_sqm){
        this.guaranteeCoveredMonthsValue$.next(Math.trunc(guarantee_deposit_amount/((fixed_rent_per_sqm/12)*contracted_area)))
        this.guaranteeCoveredDaysValue$.next(
          Math.trunc(((guarantee_deposit_amount/((fixed_rent_per_sqm/12)*contracted_area))-
            Math.trunc(guarantee_deposit_amount/((fixed_rent_per_sqm/12)*contracted_area)))*30)
        )
      }
      if(fixed_rent_total_payment){
        this.guaranteeCoveredMonthsValue$.next(Math.trunc(guarantee_deposit_amount/(fixed_rent_total_payment/12)))
        this.guaranteeCoveredDaysValue$.next(
          Math.trunc(((guarantee_deposit_amount/(fixed_rent_total_payment/12))-
            Math.trunc(guarantee_deposit_amount/(fixed_rent_total_payment/12)))*30)
        )
      }
    }
  }

  areaSumming(area: number[]){
    let sum = 0
    for (let premise of area){
      sum = sum + Number(premise)
    }
    return sum
  }

  // Validators

  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.intervalPremiseUsedArraySorted.value.length>0)
      { let i = true
        for (let interval of this.intervalPremiseUsedArraySorted.value)
        {
          if (date >= interval.startDate
            && date <= interval.expirationDate) {
            i = false
          }
        }
        return i
      }
      else return true
    }
  }

  inputRentalContractNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value !== null
        && this.rentalContractNumbersArray.value.includes(control.value)
      ) {
        console.log('contract number non valid')
        return { inputValidator: true };
      }
      return null;
    };
  }

  // inputRentContractSigningDateValidator(): ValidatorFn{
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //       if (control.value !== null
  //         && control.value >= this.intervalPremiseAllowedStartDate.value
  //         && control.value <= this.intervalPremiseAllowedExpirationDate.value
  //       ) {
  //         console.log('valid')
  //         return {
  //           inputValidator: false };
  //       }
  //       if (control.value !== null
  //         && (control.value < this.intervalPremiseAllowedStartDate.value
  //         || control.value > this.intervalPremiseAllowedExpirationDate.value)
  //       ) {
  //         console.log(this.intervalPremiseAllowedStartDate.value, this.intervalPremiseAllowedExpirationDate.value)
  //         console.log('non valid')
  //         return {
  //           inputValidator: true };
  //       }
  //     return null;
  //   };
  // }
  //
  // inputRentContractExpirationDateValidator(): ValidatorFn{
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     console.log(control.value)
  //     if (control.value !== null){
  //       if (
  //         control.value >= this.intervalPremiseAllowedStartDate.value
  //         && control.value <= this.intervalPremiseAllowedExpirationDate.value
  //       ) {
  //         return { inputValidator: false };
  //       } else {
  //         return { inputValidator: true };
  //       }
  //     }
  //     return null;
  //   };
  // }


}

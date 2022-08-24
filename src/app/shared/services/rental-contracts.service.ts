import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest, distinctUntilChanged, pairwise, startWith,
  Subscription
} from "rxjs";
import {
  BrandModel,
  PremiseModel,
  RentalContractModel,
  RentalContractModelExpanded,
  TenantModel,
  RentalContractSetupModel,
  DatesInterval,
} from "../../models/models";
import {AbstractControl, FormBuilder, ValidatorFn, Validators} from "@angular/forms";
import {ApiService} from "./api.service";
import {MatDialog} from "@angular/material/dialog";
import {EnumService} from "./enum.service";
import {RentalContractSetupService} from "./rental-contract-setup.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {GlobalAppService} from "./global-app.service";
import {DatePipe} from "@angular/common";
import {RentalContractFeesService} from "./rental-contract-fees.service";
import {DateTransformCorrectHoursPipe} from "../pipes/date-transform-correct-hours.pipe";
import {StepPaymentService} from "./step-payment.service";

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

  //Rent Contract Subscriptions
  public rentContractDateSubscription$: Subscription = new Subscription
  public rentContractPremiseSubscription$: Subscription = new Subscription
  public rentContractTenantChangeSubscription$: Subscription = new Subscription;
  public rentContractBrandSelectSubscription$: Subscription = new Subscription;
  public rentContractPremiseAreaSummingSubscription$: Subscription = new Subscription;
  public rentContractStepPaymentsValidationSubscription: Subscription = new Subscription;

  public defaultDateMin: Date = this.dateCorrectHours.transform(new Date(new Date().getFullYear()-50, 1, 1))
  public defaultDateMax: Date = this.dateCorrectHours.transform(new Date(new Date().getFullYear()+50, 1, 1))

  // Dates BehaviorSubjects
  public rentContractSigningDate$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractSigningDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractSigningDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)

  public rentContractExpirationDate$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractExpirationDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)

  public rentContractActOfTransferDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractActOfTransferDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractRentStartDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractRentStartDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractRentStartDateActual$ = new BehaviorSubject<Date>(this.defaultDateMin)

  public rentContractPremiseReturnDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractPremiseReturnDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractStopBillingDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public rentContractStopBillingDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public rentContractStopBillingDateActual$ = new BehaviorSubject<Date>(this.defaultDateMax)

  // Guarantee deposit and insurance BehaviorSubjects
  public insuranceProvidingDateDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public insuranceProvidingDateDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public insuranceExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public guaranteeDepositProvidingDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)
  public guaranteeDepositProvidingDateMax$ = new BehaviorSubject<Date>(this.defaultDateMax)
  public guaranteeBankGuaranteeExpirationDateMin$ = new BehaviorSubject<Date>(this.defaultDateMin)

  public insuranceIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositIsRequired$ = new BehaviorSubject<boolean>(false)
  public guaranteeDepositTypeSubscription$: Subscription = new Subscription()
  public guaranteeDepositType$ = new BehaviorSubject<string>('Cash')

  public guaranteeCoveredMonthsValue$: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public guaranteeCoveredDaysValue$: BehaviorSubject<number> = new BehaviorSubject<number>(0)
  public guaranteeDepositCoverageSubscription$: Subscription = new Subscription;

  // public selectedGuaranteeDepositType = this.enumService.guaranteeDepositTypes[0].value

  // Rent Contract settings BehaviorSubjects
  public fixedRentNameSubject = new BehaviorSubject<string>('')
  public fixedRentCalculationPeriod$ = new BehaviorSubject<string>('')
  public fixedRentCalculationMethod$ = new BehaviorSubject<string>('за 1 кв. м.')
  public fixedRentPrePaymentOrPostPayment = new BehaviorSubject<string>('Prepayment')
  public turnoverFeeIsApplicable$ = new BehaviorSubject<boolean>(false)
  public turnoverFeeName = new BehaviorSubject<string>('')
  public caUtilitiesCompensationIsApplicable$ = new BehaviorSubject<boolean>(false)
  public caUtilitiesCompensation = new BehaviorSubject<string>('Proportional to GLA')
  public caUtilitiesCompensationFeePrepaymentOrPostpayment = new BehaviorSubject<string>('Prepayment')

  // Validation variables
  public rentalContractNumbersArray = new BehaviorSubject<string[]>([])
  public premiseUsedArray = new BehaviorSubject<PremiseModel[]>([])
  public intervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([])
  public intervalAvailableDatesArray = new BehaviorSubject<DatesInterval[]>([{
    startDate: this.defaultDateMin,
    expirationDate: this.defaultDateMax
  }])
  public intervalDatesValidationSubscription$: Subscription = new Subscription;
  public rentContractDatesInOneInterval$ = new BehaviorSubject<Boolean>(false)

  public intervalStepFixedUsedDatesArray = new BehaviorSubject<DatesInterval[]>([])




  public rentContractFieldsDisablingSubscription: Subscription = new Subscription;

  public premises: PremiseModel[] = []
  public availablePremises = new BehaviorSubject<PremiseModel[]>([])
  public tenantContractors: TenantModel[] = []
  public brands: BrandModel[] = []
  public selectedTenantBrands: BrandModel[] = []
  public contractSetup: RentalContractSetupModel[] = []

  public selectedPremise: string[] = []
  public selectedPremiseArea: number[] = []
  public selectedTenant = ''
  public selectedBrand = ''

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public setupService: RentalContractSetupService,
    public feeService: RentalContractFeesService,
    public stepService: StepPaymentService,
    public enumService: EnumService,
    public modalContactDeleteDialog: MatDialog,
    public datepipe: DatePipe,
    private dateCorrectHours: DateTransformCorrectHoursPipe,
  )
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

  //New Contract
  initializeNewRentalContractCard(){
    this.globalService.editCardTrigger$.next(true)

    for (let contract of this.rentalContractsTableExpanded){
      this.rentalContractNumbersArray.value.push(contract.rent_contract_number)}

    this.rentalContractPrimarySubscription()

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

    this.rentalContractSecondarySubscription()

    // Create new fee arrays
    for(let fee of this.feeService.periodicalFeeSetupArray.value){
      this.feeService.newPeriodicalFeeContractArray(fee)
    }
    for(let fee of this.feeService.oneTimeFeeSetupArray.value){
      this.feeService.newOneTimeFeeContractArray(fee)
    }
    for(let fee of this.feeService.utilityFeeSetupArray.value){
      this.feeService.newUtilityFeeContractArray(fee)
    }

    // Populate fee tabs from fee arrays and add subscriptions
    for(let fee of this.feeService.periodicalFeeContractArray.value){
      this.feeService.populatePeriodicalFeeTab(fee)
      this.feeService.periodicalFeeAddSubscription(fee)
    }
    for(let fee of this.feeService.oneTimeFeeContractArray.value){
      this.feeService.populateOneTimeFeeTab(fee)
      this.feeService.oneTimeFeeAddSubscription(fee)
    }
    for(let fee of this.feeService.utilityFeeContractArray.value){
      this.feeService.populateUtilityFeeTab(fee)
    }

    // Initialize new steps

    this.stepService.fixedRentStepArray.next([])
    console.log(this.stepService.fixedRentStepArray.value)
    this.rentContractIsLoaded$.next(true)
    console.log('New rental contract card is initialized')
  }

  populateRentalContractCard(contract: RentalContractModelExpanded) {
    console.log(contract)

    for (let contract of this.rentalContractsTableExpanded){
      this.rentalContractNumbersArray.value.push(contract.rent_contract_number)}

    const index = this.rentalContractNumbersArray.value.indexOf(contract.rent_contract_number, 0);
    if (index > -1) {
      this.rentalContractNumbersArray.value.splice(index, 1)}

    this.rentalContractPrimarySubscription()

    this.form_contract.setValue({
      id: contract.id,
      rent_contract_number: contract.rent_contract_number,
      rent_contract_signing_date: contract.rent_contract_signing_date,
      rent_contract_expiration_date: contract.rent_contract_expiration_date,
      building_id: contract.building_id,
      premise_id: contract.premise_id,
      contracted_area: contract.contracted_area,
      tenant_contractor_id: contract.tenant_contractor_id,
      brand: contract.brand,
      act_of_transfer_date: contract.act_of_transfer_date,
      rent_start_date: contract.rent_start_date,
      premise_return_date: contract.premise_return_date,
      stop_billing_date:contract.stop_billing_date,

      fixed_rent_name: contract.fixed_rent_name,
      fixed_rent_calculation_period: contract.fixed_rent_calculation_period,
      fixed_rent_payment_period: contract.fixed_rent_payment_period,
      fixed_rent_calculation_method: contract.fixed_rent_calculation_method,

      fixed_rent_per_sqm: contract.fixed_rent_per_sqm,
      fixed_rent_total_payment: contract.fixed_rent_total_payment,
      fixed_rent_prepayment_or_postpayment: contract.fixed_rent_prepayment_or_postpayment,

      fixed_rent_advance_payment_day: contract.fixed_rent_advance_payment_day,
      fixed_rent_post_payment_day: contract.fixed_rent_post_payment_day,
      fixed_rent_indexation_type: contract.fixed_rent_indexation_type,
      fixed_rent_indexation_fixed: contract.fixed_rent_indexation_fixed,

      turnover_fee_is_applicable: contract.turnover_fee_is_applicable,
      turnover_fee: contract.turnover_fee,
      turnover_fee_period: contract.turnover_fee_period,
      turnover_data_providing_day: contract.turnover_data_providing_day,
      turnover_fee_payment_day: contract.turnover_fee_payment_day,

      CA_utilities_compensation_is_applicable: contract.CA_utilities_compensation_is_applicable,
      CA_utilities_compensation_type: contract.CA_utilities_compensation_type,

      CA_utilities_compensation_fixed_indexation_type: contract.CA_utilities_compensation_fixed_indexation_type,
      CA_utilities_compensation_fee_fixed: contract.CA_utilities_compensation_fee_fixed,
      CA_utilities_compensation_fee_fixed_indexation_type_fixed: contract.CA_utilities_compensation_fee_fixed_indexation_type_fixed,

      CA_utilities_compensation_fee_prepayment_or_postpayment: contract.CA_utilities_compensation_fee_prepayment_or_postpayment,
      CA_utilities_compensation_fee_advance_payment_day: contract.CA_utilities_compensation_fee_advance_payment_day,
      CA_utilities_compensation_fee_post_payment_day: contract.CA_utilities_compensation_fee_post_payment_day,

      guarantee_deposit_required: contract.guarantee_deposit_required,
      guarantee_deposit_coverage_number_of_periods: contract.guarantee_deposit_coverage_number_of_periods,
      guarantee_deposit_type: contract.guarantee_deposit_type,
      guarantee_deposit_amount: contract.guarantee_deposit_amount,
      guarantee_deposit_contract_providing_date: contract.guarantee_deposit_contract_providing_date,
      guarantee_deposit_actual_providing_date: contract.guarantee_deposit_actual_providing_date,
      guarantee_bank_guarantee_expiration_date: contract.guarantee_bank_guarantee_expiration_date,

      insurance_required: contract.insurance_required,
      insurance_contract_providing_date: contract.insurance_contract_providing_date,
      insurance_actual_providing_date: contract.insurance_contract_providing_date,
      insurance_expiration_date: contract.insurance_expiration_date,

      last_updated: contract.last_updated,
      user_updated: contract.user_updated,
    })
    this.selectedPremise = contract.premise_number
    this.selectedTenant = contract.tenant_contractor_company_name
    this.selectedBrand = contract.brand_name

    this.rentalContractExistingInitialSet(contract)

    this.rentalContractSecondarySubscription()

    this.depositCoverageCalculation(
      this.form_contract.controls['contracted_area'].value,
      this.form_contract.controls['fixed_rent_per_sqm'].value,
      this.form_contract.controls['fixed_rent_total_payment'].value,
      this.form_contract.controls['fixed_rent_calculation_period'].value,
      this.form_contract.controls['guarantee_deposit_amount'].value,
      this.fixedRentCalculationMethod$.value
    )

    this.feeService.setFeeNames()

    for(let fee of this.feeService.periodicalFeeContractArray.value){
      this.feeService.populatePeriodicalFeeTab(fee)
    }
    for(let fee of this.feeService.oneTimeFeeContractArray.value){
      this.feeService.populateOneTimeFeeTab(fee)
    }
    for(let fee of this.feeService.utilityFeeContractArray.value){
      this.feeService.populateUtilityFeeTab(fee)
    }
    for(let fee of this.feeService.periodicalFeeContractArray.value){
      this.feeService.periodicalFeeAddSubscription(fee)
    }
    this.feeService.feeFormsEnablingSubscription()
    this.rentContractIsLoaded$.next(true)

    console.log('Rent contract is loaded')
  }

  // Initial dates Behavior subjects set
  rentalContractExistingInitialSet(contract: RentalContractModelExpanded)
  {
    this.availablePremises.next(this.premises)

    //Primary dates initial set
    this.rentContractSigningDate$.next(contract.rent_contract_signing_date)
    this.rentContractExpirationDateMin$.next(contract.rent_contract_signing_date)

    this.rentContractExpirationDate$.next(contract.rent_contract_expiration_date)
    this.rentContractSigningDateMax$.next(contract.rent_contract_expiration_date)

    //Secondary dates initial set
    this.rentContractActOfTransferDateMin$.next(contract.rent_contract_signing_date)
    this.rentContractActOfTransferDateMax$.next(contract.rent_contract_expiration_date)
    this.rentContractPremiseReturnDateMin$.next(contract.rent_contract_signing_date)
    this.rentContractPremiseReturnDateMax$.next(contract.rent_contract_expiration_date)
    this.rentContractRentStartDateMin$.next(contract.rent_contract_signing_date)
    this.rentContractRentStartDateMax$.next(contract.rent_contract_expiration_date)
    this.rentContractStopBillingDateMin$.next(contract.rent_contract_signing_date)
    this.rentContractStopBillingDateMax$.next(contract.rent_contract_expiration_date)
    this.insuranceProvidingDateDateMin$.next(contract.rent_contract_signing_date)
    this.insuranceProvidingDateDateMax$.next(contract.rent_contract_expiration_date)

    //Insurance and guarantee dates initial set
    this.insuranceExpirationDateMin$.next(contract.rent_contract_signing_date)
    this.guaranteeDepositProvidingDateMin$.next(contract.rent_contract_signing_date)
    this.guaranteeBankGuaranteeExpirationDateMin$.next(contract.rent_contract_signing_date)
    this.guaranteeDepositProvidingDateMax$.next(contract.rent_contract_expiration_date)

    if(contract.premise_id){
      this.populateAvailableDatesIntervalArray(contract.premise_id)
      if (this.premises.length >0 ){
        this.premiseAreaCalculation(contract.premise_id, this.premises)
      }
      if(this.intervalAvailableDatesArray.value
        &&  this.rentContractSigningDate$.value
        &&  this.rentContractExpirationDate$.value
      ){
        this.checkIfDatesInOneInterval(
          this.intervalAvailableDatesArray.value,
          this.rentContractSigningDate$.value,
          this.rentContractExpirationDate$.value)
      }
    }

  }

  // Single field valueChanges subscription
  rentalContractPrimarySubscription(){

    this.form_contract.controls['fixed_rent_name'].valueChanges.subscribe(data=>{
      this.fixedRentNameSubject.next(data)
    })

    this.form_contract.controls['turnover_fee_is_applicable'].valueChanges.subscribe(data => {
        if (data){
          this.turnoverFeeName.next( ' и % от ТО')
          this.turnoverFeeIsApplicable$.next(true)}
        if (!data){
          this.turnoverFeeName.next( '')
          this.turnoverFeeIsApplicable$.next(false)
        }
      })

    this.form_contract.controls['fixed_rent_calculation_period'].valueChanges.subscribe(data => {
        if (data == 'Month'){
          this.fixedRentCalculationPeriod$.next(' в месяц')}
        if (data == 'Year'){
          this.fixedRentCalculationPeriod$.next(' в год')
        }
      })

    this.form_contract.controls['CA_utilities_compensation_is_applicable'].valueChanges.subscribe(data=>{
        if (data){
          this.caUtilitiesCompensationIsApplicable$.next(true)}
        if(!data){
          this.caUtilitiesCompensationIsApplicable$.next(false)
        }
      })

    this.form_contract.controls['guarantee_deposit_required'].valueChanges.subscribe(data=>{
      if (data){
          this.guaranteeDepositIsRequired$.next(true)}
      if(!data){
        this.guaranteeDepositIsRequired$.next(false)}
      })

    this.form_contract.controls['guarantee_deposit_type'].valueChanges.subscribe(data=>{
      this.guaranteeDepositType$.next(data)
    })

    this.form_contract.controls['insurance_required'].valueChanges.subscribe(data=>{
      this.insuranceIsRequired$.next(data)
    })

    // Tenant change subscription
    this.rentContractTenantChangeSubscription$ =
      this.form_contract.controls['tenant_contractor_id'].valueChanges
        .subscribe(
          data => {
            for (let tenant of this.tenantContractors){
              if (tenant.id == data){
                this.selectedTenant = tenant.company_name
                console.log('Tenant is set to', this.selectedTenant)
              }}
            this.getSelectedBrands(data)
          })

    // Brand change subscription
    this.rentContractBrandSelectSubscription$ =
      this.form_contract.controls['brand'].valueChanges
        .subscribe(
          data=>{
            for (let brand of this.selectedTenantBrands){
              if(brand.id == data){
                this.selectedBrand = brand.brand_name
                console.log('Brand is set to', this.selectedBrand)
              }}})

    // Signing and expiration dates change subscription
    this.rentContractDateSubscription$ = combineLatest([
      this.form_contract.controls['rent_contract_signing_date'].valueChanges,
      this.form_contract.controls['rent_contract_expiration_date'].valueChanges
    ]).subscribe(data => {
        console.log(data)
        // Change date
      this.populateAvailablePremisesArray(data[0], data[1])

      if(data[0] != null
          && data[0] != '')
        {
          console.log('Rental contract signing date is set to ', data[0])
          this.rentContractSigningDate$.next(data[0])
          this.rentContractExpirationDateMin$.next(data[0])
          this.rentContractActOfTransferDateMin$.next(data[0])
          this.rentContractPremiseReturnDateMin$.next(data[0])
          this.rentContractRentStartDateMin$.next(data[0])
          this.rentContractStopBillingDateMin$.next(data[0])

          this.insuranceProvidingDateDateMin$.next(data[0])
          this.insuranceExpirationDateMin$.next(data[0])
          this.guaranteeDepositProvidingDateMin$.next(data[0])
          this.guaranteeBankGuaranteeExpirationDateMin$.next(data[0])
        }

        if(data[1] != null
          && data[1] != '')
        {
          console.log('Rental contract expiration date is set to ', data[1])
          this.rentContractExpirationDate$.next(data[1])
          this.rentContractSigningDateMax$.next(data[1])
          this.rentContractActOfTransferDateMax$.next(data[1])
          this.rentContractPremiseReturnDateMax$.next(data[1])
          this.rentContractRentStartDateMax$.next(data[1])
          this.rentContractStopBillingDateMax$.next(data[1])

          this.insuranceProvidingDateDateMax$.next(data[1])
          this.guaranteeDepositProvidingDateMax$.next(data[1])
        }
        if (data[0] == null
          || data[0] == ''
        ){
          console.log('Signing date is default')
          this.rentContractSigningDate$.next(this.defaultDateMin)
        }
        if (data[1] == null
          || data[1] == ''
        ){
          console.log('Expiration date is default')
          this.rentContractExpirationDate$.next(this.defaultDateMax)
        }
      }
    )

    this.guaranteeDepositCoverageSubscription$ = combineLatest([
      this.form_contract.controls['contracted_area'].valueChanges,
      this.form_contract.controls['fixed_rent_per_sqm'].valueChanges,
      this.form_contract.controls['fixed_rent_total_payment'].valueChanges,
      this.form_contract.controls['fixed_rent_calculation_period'].valueChanges,
      this.form_contract.controls['guarantee_deposit_amount'].valueChanges,
      this.fixedRentCalculationMethod$
    ]).pipe(distinctUntilChanged())
      .subscribe( data=>{
        this.depositCoverageCalculation(data[0],data[1],data[2],data[3],data[4],data[5],)
      })
    console.log('Single field subscriptions are set are set')
  }

  // Multi field subscription
  rentalContractSecondarySubscription(){
    console.log('Rent Contract Subscription added')

    // Premise id subscription
    this.rentContractPremiseSubscription$ =
      this.form_contract.controls['premise_id'].valueChanges
        .pipe(
          startWith(null), pairwise())
        .subscribe(data => {
          if (data[1].length > 0)
          {
            console.log('Premise is set', data[1])
              this.populateAvailableDatesIntervalArray(data[1])
              this.premiseAreaCalculation(data[1], this.premises)
          }
          if (data[1].length == 0)
          {
            console.log('Premise is NOT set', data[1])
              this.populateAvailableDatesIntervalArray(data[1])
              this.premiseAreaCalculation(data[1], this.premises)
          }
        })



    this.intervalDatesValidationSubscription$ = combineLatest([
      this.intervalAvailableDatesArray,
      this.rentContractSigningDate$,
      this.rentContractExpirationDate$
    ]).subscribe(data=> {
      console.log(data)
          if (data[0].length > 0) {
            this.checkIfDatesInOneInterval(
              this.intervalAvailableDatesArray.value,
              this.rentContractSigningDate$.value,
              this.rentContractExpirationDate$.value
            )
          }

    })

    this.guaranteeDepositTypeSubscription$ = this.form_contract.controls['guarantee_deposit_type'].valueChanges.subscribe(
      data =>{
        this.guaranteeDepositType$.next(data)
        console.log(data)
        if(data == 'Cash' || data == 'Corporate_guarantee'){
          console.log('Bank guarantee disabled')
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable({ emitEvent: false })
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
        }
        if(data == 'Bank_guarantee'){
          console.log('Bank guarantee enabled')
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].enable({ emitEvent: false })
        }

      }
    )

    this.rentContractFieldsDisablingSubscription = this.globalService.editCardTrigger$
      .subscribe(data=>{
        console.log(data)
        if (!data){
          console.log('Global trigger form disabled')
          this.form_contract.disable({ emitEvent: false })
        }

        if (data && !this.rentContractDatesInOneInterval$.value){
          console.log('Secondary dates reset and disabled')
          this.form_contract.enable({ emitEvent: false })

          this.rentContractDatesFormReset()
          this.rentContractDatesDisable()
        }
        if (data && this.rentContractDatesInOneInterval$.value){
          console.log('Secondary dates enabled')
          this.form_contract.enable({ emitEvent: false })
          this.rentContractDatesEnable()
        }
        if(data && (this.guaranteeDepositType$.value == 'Cash' || this.guaranteeDepositType$.value == 'Corporate_guarantee')){
          console.log('Bank guarantee disabled')
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable({ emitEvent: false })
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset()
        }
        if(data && (this.guaranteeDepositType$.value == 'Bank_guarantee')){
          console.log('Bank guarantee enabled')
          this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].enable({ emitEvent: false })
        }
      })

    this.rentContractStepPaymentsValidationSubscription = combineLatest([
      this.form_contract.controls['rent_start_date'].valueChanges,
      this.form_contract.controls['stop_billing_date'].valueChanges,
    ]).subscribe(data => {
      this.rentContractRentStartDateActual$.next(data[0])
      this.rentContractStopBillingDateActual$.next(data[1])
    })
  }

  // Reset Rental contract fees
  rentContractReset(){

    this.tenantContractors = []
    this.premises = []
    this.brands = []
    this.selectedTenantBrands = []
    this.rentalContractNumbersArray.next([])

    this.feeService.periodicalFeeContractArray.next([])
    this.feeService.oneTimeFeeContractArray.next([])
    this.feeService.utilityFeeContractArray.next([])
    this.stepService.fixedRentStepArray.next([])

    this.feeService.periodicalFeeTabs.clear()
    this.feeService.oneTimeFeeTabs.clear()
    this.feeService.utilityFeeTabs.clear()
    this.stepService.fixedRentStepFormLines.clear()

    this.form_contract.reset()
    this.feeService.periodicalFeeTabs.reset()
    this.feeService.oneTimeFeeTabsForm.reset()
    this.feeService.utilityFeeTabsForm.reset()

    this.stepService.fixedRentStepForm.reset()
  }

  // Reset Rental contract fees
  rentContractDatesFormLimitsReset(){
    console.log('Dates limits reset')
    // this.rentContractSigningDate$.next(this.defaultDateMin)
    // this.rentContractExpirationDate$.next(this.defaultDateMax)
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
    console.log('Secondary date forms are reset')
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
    console.log('Secondary date forms are enabled')
    this.form_contract.controls['act_of_transfer_date'].enable({ emitEvent: false })
    this.form_contract.controls['premise_return_date'].enable({ emitEvent: false })
    this.form_contract.controls['rent_start_date'].enable({ emitEvent: false })
    this.form_contract.controls['stop_billing_date'].enable({ emitEvent: false })
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].enable({ emitEvent: false })
    this.form_contract.controls['guarantee_deposit_actual_providing_date'].enable({ emitEvent: false })
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].enable({ emitEvent: false })
    this.form_contract.controls['insurance_contract_providing_date'].enable({ emitEvent: false })
    this.form_contract.controls['insurance_actual_providing_date'].enable({ emitEvent: false })
    this.form_contract.controls['insurance_expiration_date'].enable({ emitEvent: false })
  }

  rentContractDatesDisable(){
    console.log('Secondary date forms are disabled')
    this.form_contract.controls['act_of_transfer_date'].disable({ emitEvent: false })
    this.form_contract.controls['premise_return_date'].disable({ emitEvent: false })
    this.form_contract.controls['rent_start_date'].disable({ emitEvent: false })
    this.form_contract.controls['stop_billing_date'].disable({ emitEvent: false })
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].disable({ emitEvent: false })
    this.form_contract.controls['guarantee_deposit_actual_providing_date'].disable({ emitEvent: false })
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].disable({ emitEvent: false })
    this.form_contract.controls['insurance_contract_providing_date'].disable({ emitEvent: false })
    this.form_contract.controls['insurance_actual_providing_date'].disable({ emitEvent: false })
    this.form_contract.controls['insurance_expiration_date'].disable({ emitEvent: false })
  }

  populateAvailableDatesIntervalArray(premise_IdsArray: number[]){
    console.log('Available dates calculation started')

    this.intervalAvailableDatesArray.next([{
      startDate: this.defaultDateMin,
      expirationDate: this.defaultDateMax
    }])
    this.intervalUsedDatesArray.next([])
    let intervalAvailableDatesArrayTemp = [{
      startDate: this.defaultDateMin,
      expirationDate: this.defaultDateMax
    }]

    if(premise_IdsArray.length > 0){
      if(this.form_contract.controls['id'].value){
        console.log('Existing contract intervals', this.form_contract.controls['id'].value)
        for (let contract of this.rentalContractsTableExpanded) {
          let premiseIntersectArray = contract.premise_id.filter(value => premise_IdsArray.includes(value))
          if (premiseIntersectArray.length > 0 && this.form_contract.controls['id'].value != contract.id) {
            this.intervalUsedDatesArray.value[0] = {
              startDate: new Date(contract.rent_contract_signing_date),
              expirationDate: new Date(contract.rent_contract_expiration_date)
            }}
        }}

      if(!this.form_contract.controls['id'].value){
        console.log('New contract intervals')
        for (let contract of this.rentalContractsTableExpanded) {
          let premiseIntersectArray = contract.premise_id.filter(value => premise_IdsArray.includes(value))
          if (premiseIntersectArray.length > 0) {
            this.intervalUsedDatesArray.value.push({
              startDate: new Date(contract.rent_contract_signing_date),
              expirationDate: new Date(contract.rent_contract_expiration_date)
            })
          }
        }
      }

      this.intervalUsedDatesArray.value.sort
      (function (a,b){
        return a.startDate.getTime() < b.startDate.getTime() ? -1
          : a.startDate.getTime() > b.startDate.getTime() ? 1
            : 0
      })

      if (this.intervalUsedDatesArray.value.length > 0)
      {
        let startDate = this.intervalUsedDatesArray.value[0].startDate

        intervalAvailableDatesArrayTemp[0] = {
          startDate: this.defaultDateMin,
          expirationDate:
            new Date (startDate.getTime() - (1000 * 60 * 60 * 24))
        }

        this.intervalUsedDatesArray.value.forEach((value, index) =>
        {
          if (index > 0) {
            let startDate = this.intervalUsedDatesArray.value[index].startDate
            let expirationDate = this.intervalUsedDatesArray.value[index - 1].expirationDate
            intervalAvailableDatesArrayTemp[index] = {
              startDate: new Date(expirationDate.getTime() + (1000 * 60 * 60 * 24)) ,
              expirationDate: new Date(startDate.getTime() - (1000 * 60 * 60 * 24))
            }
          }
        })

        let expirationDate =
          this.intervalUsedDatesArray.value[this.intervalUsedDatesArray.value.length - 1].expirationDate

        intervalAvailableDatesArrayTemp[this.intervalUsedDatesArray.value.length] = {
          startDate: new Date(expirationDate.getTime() + (1000 * 60 * 60 * 24)) ,
          expirationDate: this.defaultDateMax
        }
      }
    }
    if(premise_IdsArray.length == 0){
      intervalAvailableDatesArrayTemp[0] = {
        startDate: this.defaultDateMin,
        expirationDate: this.defaultDateMax
      }
    }
    this.intervalAvailableDatesArray.next(intervalAvailableDatesArrayTemp)
    console.log('Allowed intervals are calculated', this.intervalAvailableDatesArray.value)
  }

  populateAvailablePremisesArray(signingDate : Date | null, expirationDate: Date | null){
    this.availablePremises.next([])
    let unavailablePremises: number[] = []
    let contractsArray: RentalContractModelExpanded[] = []
    for (let contract of this.rentalContractsTableExpanded){
      contractsArray.push(contract)
    }

    if(this.form_contract.controls['id'].value){
      let id = this.form_contract.controls['id'].value
      const index = contractsArray.findIndex(contract => {return contract.id == id});
      if (index > -1) {
        contractsArray.splice(index, 1)}
    }

    for (let contract of contractsArray) {
      if (signingDate != null
        && signingDate >= contract.rent_contract_signing_date
        && signingDate <= contract.rent_contract_expiration_date) {
          for (let premise of contract.premise_id) {
            if (!unavailablePremises.includes(premise)) {
              unavailablePremises.push(premise)
              console.log('Premise', premise, 'unavailable')
            }
        }
      }
      if (expirationDate != null
        && expirationDate >= contract.rent_contract_signing_date
        && expirationDate <= contract.rent_contract_expiration_date){
          for (let premise of contract.premise_id) {
            if (!unavailablePremises.includes(premise)) {
              unavailablePremises.push(premise)
              console.log('Premise', premise, 'unavailable')
            }
        }
      }
      if (signingDate != null && expirationDate != null
        && signingDate < contract.rent_contract_signing_date
        && expirationDate > contract.rent_contract_expiration_date) {
          for (let premise of contract.premise_id) {
            if (!unavailablePremises.includes(premise)) {
              unavailablePremises.push(premise)
              console.log('Premise', premise, 'unavailable')
            }
          }
      }
    }
    console.log(unavailablePremises)
    for (let premise of this.premises){
      if (!unavailablePremises.includes(premise.id)){
        this.availablePremises.value.push(premise)
      }
    }
    console.log(this.availablePremises.value)
  }

  checkIfDatesInOneInterval(
    intervalAvailableDatesArray: DatesInterval[],
    rentContractSigningDate: Date,
    rentContractExpirationDate: Date
  ){
    console.log('rentContractDatesInOneInterval$ calculation...')
    console.log(intervalAvailableDatesArray)
    console.log(rentContractSigningDate)
    console.log(rentContractExpirationDate)
    this.rentContractDatesInOneInterval$.next(false)
    let i = 0
    if (
      rentContractSigningDate > this.defaultDateMin
      && rentContractExpirationDate < this.defaultDateMax
      && rentContractSigningDate !=null
      && rentContractExpirationDate !=null
    ) {
      for (let interval of intervalAvailableDatesArray) {
        if (rentContractSigningDate >= interval.startDate
          && rentContractSigningDate <= interval.expirationDate
          && rentContractExpirationDate >= interval.startDate
          && rentContractExpirationDate <= interval.expirationDate) {
          i = i + 1
        }
        console.log(i)
      }
    }
      if (i > 0){
        {console.log('Signing and Expiration dates are in one interval')
          this.rentContractDatesInOneInterval$.next(true)
          this.rentContractDatesEnable()
        }
      }
      else {
      console.log('Signing and Expiration dates are NOT in one interval')
      this.rentContractDatesInOneInterval$.next(false)
      this.rentContractDatesFormReset()
      this.rentContractDatesDisable()
    }

  }

  depositCoverageCalculation(contracted_area: number, fixed_rent_per_sqm: number,  fixed_rent_total_payment: number,
                             fixed_rent_calculation_period: string, guarantee_deposit_amount: number,
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


  //Dynamically update existing Table row
  updateTableRow(data: RentalContractModel, premise: string[], tenant: string, brand: string) {
    let resultContract: RentalContractModelExpanded = {
      ...data,
      premise_number: premise,
      tenant_contractor_company_name: tenant,
      brand_name: brand
    }
    console.log(resultContract)
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
    this.caUtilitiesCompensationIsApplicable$.next($event.checked)}
  guaranteeDepositRequiredChange($event: MatSlideToggleChange){
    this.guaranteeDepositIsRequired$.next($event.checked)
  }
  insuranceRequiredChange($event: MatSlideToggleChange){
    this.insuranceIsRequired$.next($event.checked)
  }



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

  premiseAreaCalculation(premise_id: number[], premises: PremiseModel[])
  {
    this.selectedPremiseArea = []
    this.selectedPremise = []
    this.form_contract.controls['contracted_area'].setValue('')
    if (premise_id.length > 0){
      for (let id of premise_id) {
        for (let premise of premises) {
          if (premise.id === id) {
            this.selectedPremiseArea.push(premise.measured_area)
            this.selectedPremise.push(premise.number)
            this.form_contract.controls['contracted_area'].setValue(this.areaSumming(this.selectedPremiseArea))
          }
        }
      }
    } if (premise_id.length == 0){
    this.form_contract.controls['contracted_area'].setValue('')
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
      if (this.intervalUsedDatesArray.value.length>0)
      { let i = true
        for (let interval of this.intervalUsedDatesArray.value)
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

  clearRentContractSigningDate(event: MouseEvent) {
    event.stopPropagation();
    this.form_contract.controls['rent_contract_signing_date'].reset('')
    this.rentContractSigningDate$.next(this.defaultDateMin)
  }

  clearRentContractExpirationDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['rent_contract_expiration_date'].reset('')
    this.rentContractExpirationDate$.next(this.defaultDateMax)
  }

  clearRentContractActOfTransferDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['act_of_transfer_date'].reset('')
  }
  clearRentContractRentStartDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['rent_start_date'].reset('')
  }
  clearRentContractPremiseReturnDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['premise_return_date'].reset('')
  }
  clearRentContractStopBillingDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['stop_billing_date'].reset('')
  }
  clearRentContractGuaranteeDepositContractProvidingDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['guarantee_deposit_contract_providing_date'].reset('')
  }
  clearRentContractGuaranteeBankGuaranteeExpirationDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['guarantee_bank_guarantee_expiration_date'].reset('')
  }
  clearRentContractInsuranceContractProvidingDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['insurance_contract_providing_date'].reset('')
  }
  clearRentContractInsuranceExpirationDate(event: MouseEvent){
    event.stopPropagation();
    this.form_contract.controls['insurance_expiration_date'].reset('')
  }

  clearRentContractOneTimeFeePaymentDate(event: MouseEvent, i: number){
    event.stopPropagation();
    this.feeService.oneTimeFeeTabs.controls[i].get('one_time_fee_contract_payment_date')?.reset('')
  }

  changeDateFormatFromApi(contract: RentalContractModel){
    if (contract.rent_contract_signing_date){contract.rent_contract_signing_date = this.dateCorrectHours.transform(contract.rent_contract_signing_date)}
    if (contract.rent_contract_expiration_date){contract.rent_contract_expiration_date = this.dateCorrectHours.transform(contract.rent_contract_expiration_date)}
    if (contract.act_of_transfer_date){contract.act_of_transfer_date = this.dateCorrectHours.transform(contract.act_of_transfer_date)}
    if (contract.rent_start_date){contract.rent_start_date = this.dateCorrectHours.transform(contract.rent_start_date)}
    if (contract.premise_return_date){contract.premise_return_date = this.dateCorrectHours.transform(contract.premise_return_date)}
    if (contract.stop_billing_date){contract.stop_billing_date = this.dateCorrectHours.transform(contract.stop_billing_date)}
    if (contract.guarantee_deposit_contract_providing_date){contract.guarantee_deposit_contract_providing_date = this.dateCorrectHours.transform(contract.guarantee_deposit_contract_providing_date)}
    if (contract.guarantee_deposit_actual_providing_date){contract.guarantee_deposit_actual_providing_date = this.dateCorrectHours.transform(contract.guarantee_deposit_actual_providing_date)}
    if (contract.guarantee_bank_guarantee_expiration_date){contract.guarantee_bank_guarantee_expiration_date = this.dateCorrectHours.transform(contract.guarantee_bank_guarantee_expiration_date)}
    if (contract.insurance_contract_providing_date){contract.insurance_contract_providing_date = this.dateCorrectHours.transform(contract.insurance_contract_providing_date)}
    if (contract.insurance_actual_providing_date){contract.insurance_actual_providing_date = this.dateCorrectHours.transform(contract.insurance_actual_providing_date)}
    if (contract.insurance_expiration_date){contract.insurance_expiration_date = this.dateCorrectHours.transform(contract.insurance_expiration_date)}
    if (contract.last_updated){contract.last_updated = this.dateCorrectHours.transform(contract.last_updated)}
    return contract
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

}

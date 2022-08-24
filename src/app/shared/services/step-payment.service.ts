import { Injectable } from '@angular/core';
import {FormArray, FormBuilder, FormControl, Validators} from "@angular/forms";
import {ApiService} from "./api.service";
import {GlobalAppService} from "./global-app.service";
import {EnumService} from "./enum.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {BehaviorSubject, Subscription} from "rxjs";
import {
  DatesInterval,
  FixedRentIndexationStepModel,
  FixedRentStepModel, PeriodicalFeeIndexationStepModel, PeriodicalFeeStepModel,
  TurnoverFeeStepModel
} from "../../models/models";
import {DateTransformCorrectHoursPipe} from "../pipes/date-transform-correct-hours.pipe";
import {DatePipe} from "@angular/common";
import {ArraySortPipe} from "../pipes/array-sort.pipe";
import {
  FixedRentStepComponent
} from "../../contracts/rental-contracts/rental-contracts-form/step-payments/fixed-rent-step/fixed-rent-step.component";
import {
  FixedRentIndexationStepComponent
} from "../../contracts/rental-contracts/rental-contracts-form/step-payments/fixed-rent-indexation-step/fixed-rent-indexation-step.component";

@Injectable({
  providedIn: 'root'
})
  export class StepPaymentService {

  // Validation variables
  public rentContractRentStartDateActual: Date = new Date()
  public rentContractStopBillingDateActualDate: Date = new Date()
  public formChangesSubscription: Subscription = new Subscription;

  //Fixed rent steps
  public fixedRentStepArray = new BehaviorSubject<FixedRentStepModel[]>([])// Step array
  public fixedRentStepDeletedArray = new BehaviorSubject<FixedRentStepModel[]>([])// deleted steps to remove from DB
  public fixedRentIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public fixedRentIntervalUsedDatesArrayTemp: DatesInterval[] = []//  Step intervals except edited one, called at the moment of edit date

  //Fixed rent indexation steps
  public fixedRentIndexationStepArray = new BehaviorSubject<FixedRentIndexationStepModel[]>([])//Step array
  public fixedRentIndexationStepDeletedArray = new BehaviorSubject<FixedRentIndexationStepModel[]>([])// deleted steps to remove from DB
  public fixedRentIndexationIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public fixedRentIndexationIntervalUsedDatesArrayTemp: DatesInterval[] = []//  Step intervals except edited one, called at the moment of edit date

  //Turnover fee steps
  public turnoverFeeStepArray = new BehaviorSubject<TurnoverFeeStepModel[]>([])// Step array
  public turnoverFeeStepDeletedArray = new BehaviorSubject<TurnoverFeeStepModel[]>([])// deleted steps to remove from DB
  public turnoverFeeIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public turnoverFeeIntervalUsedDatesArrayTemp: DatesInterval[] = []// t Step intervals except edited one, called at the moment of edit date

  //Periodical fee steps
  public periodicalFeeStepArray = new BehaviorSubject<PeriodicalFeeStepModel[]>([])// Step array
  public periodicalFeeStepDeletedArray = new BehaviorSubject<PeriodicalFeeStepModel[]>([])// deleted steps to remove from DB
  public periodicalFeeIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public periodicalFeeIntervalUsedDatesArrayTemp: DatesInterval[] = []// t Step intervals except edited one, called at the moment of edit date

  //Periodical fee indexation steps
  public periodicalFeeIndexationStepArray = new BehaviorSubject<PeriodicalFeeIndexationStepModel[]>([])// Step array
  public periodicalFeeIndexationStepDeletedArray = new BehaviorSubject<PeriodicalFeeIndexationStepModel[]>([])// deleted steps to remove from DB
  public periodicalFeeIndexationIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public periodicalFeeIndexationIntervalUsedDatesArrayTemp: DatesInterval[] = []// t Step intervals except edited one, called at the moment of edit date

  public formDisablingSubscription: Subscription = new Subscription;

  constructor(
    public apiService: ApiService,
    public globalService: GlobalAppService,
    public enumService: EnumService,
    public fb: FormBuilder,
    private dialog: MatDialog,
    private datepipe: DatePipe,
    private dateCorrectHours: DateTransformCorrectHoursPipe,
    private arraySortPipe: ArraySortPipe,
  ) {
  }

  public fixedRentStepForm = this.fb.group({
    fixedRentStepFormArray: this.fb.array([])
  })
  public fixedRentStepFormLines: FormArray = this.fixedRentStepForm.get('fixedRentStepFormArray') as FormArray

  public fixedRentIndexationStepForm = this.fb.group({
      fixedRentIndexationStepFormArray: this.fb.array([])
    })
    public fixedRentIndexationStepFormLines: FormArray = this.fixedRentIndexationStepForm.get('fixedRentIndexationStepFormArray') as FormArray

  public turnoverFeeStepForm = this.fb.group({
    turnoverFeeStepFormArray: this.fb.array([])
      })
      public turnoverFeeStepFormLines: FormArray = this.turnoverFeeStepForm.get('turnoverFeeStepFormArray') as FormArray

  public periodicalFeeStepForm = this.fb.group({
    periodicalFeeStepFormArray: this.fb.array([])
      })
      public periodicalFeeStepFormLines: FormArray = this.periodicalFeeStepForm.get('periodicalFeeStepFormArray') as FormArray

  public periodicalFeeIndexationStepForm = this.fb.group({
    periodicalFeeIndexationStepFormArray: this.fb.array([])
      })
      public periodicalFeeIndexationStepFormLines: FormArray = this.periodicalFeeIndexationStepForm.get('periodicalFeeIndexationStepFormArray') as FormArray


  // Fixed Rent steps

  fixedRentStepOpen() {
    if (this.fixedRentStepArray.value.length == 0) {
      this.setNewFixedRentStepFormLine()
    }
    if (this.fixedRentStepArray.value.length > 0
      && this.fixedRentStepArray.value.length != this.fixedRentStepFormLines.length
    ) {
      this.fixedRentStepArray.value.forEach((step)=>{
        this.fixedRentIntervalUsedDatesArray.value.push({
          startDate: step.start_date,
          expirationDate: step.expiration_date
        })
        this.populateFixedRentStepForm(step)
      })
    }
    this.initializeSubscriptions()
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1000px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(FixedRentStepComponent, dialogConfig)
  }

  setNewFixedRentStepFormLine() {
    const stepObject = {} as FixedRentStepModel
    this.fixedRentStepArray.value.push(stepObject)
    this.fixedRentStepFormLines.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
        rent_contract_additional_agreement_id: new FormControl(''),
        start_date: new FormControl('', Validators.required),
        expiration_date: new FormControl('', Validators.required),
        fixed_rent_amount: new FormControl('',
          [Validators.required, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")]),
        fixed_rent_calculation_period: new FormControl(''),
        fixed_rent_calculation_method: new FormControl(''),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    console.log('New fixed Rent line is added')
    return this.fixedRentStepFormLines
  }

  populateFixedRentStepForm(step: FixedRentStepModel) {
    this.fixedRentStepFormLines.push(
      this.fb.group({
        id: new FormControl(step.id),
        rent_contract_id: new FormControl(step.rent_contract_id),
        rent_contract_additional_agreement_id: new FormControl(step.rent_contract_additional_agreement_id),
        start_date: new FormControl(step.start_date, Validators.required),
        expiration_date: new FormControl(step.expiration_date, Validators.required),
        fixed_rent_amount: new FormControl(step.fixed_rent_amount,
          [Validators.required, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")]),
        fixed_rent_calculation_period: new FormControl(step.fixed_rent_calculation_period),
        fixed_rent_calculation_method: new FormControl(step.fixed_rent_calculation_method),
        last_updated: new FormControl(step.last_updated),
        user_updated: new FormControl(step.user_updated),
      })
    )
    console.log('Fixed Rent line is populated')
    return this.fixedRentStepFormLines
  }

  deleteFixedRentStepLine(i: number, step: FixedRentStepModel) {
    this.fixedRentStepFormLines.removeAt(i)
    this.fixedRentStepArray.value.splice(i, 1)
    if (step.id) {
      console.log(step)
      this.fixedRentStepDeletedArray.value.push(step)
    }
  }

  clearFixedRentStepPaymentStartDate(event: MouseEvent, i: number) {
    event.stopPropagation();
    console.log(event)
    console.log(i)
    this.fixedRentStepFormLines.controls[i].get('start_date')?.reset('')
  }

  clearFixedRentStepPaymentExpirationDate(event: MouseEvent, i: number) {
    event.stopPropagation();
    console.log(event)
    console.log(i)
    this.fixedRentStepFormLines.controls[i].get('expiration_date')?.reset('')
  }

  // Set dates Validation interval
  setFixedRentIntervalUsedDatesArrayTemp(event: MouseEvent, i: number){
    this.fixedRentIntervalUsedDatesArrayTemp = []
    this.fixedRentIntervalUsedDatesArray.value.forEach(step =>{
      this.fixedRentIntervalUsedDatesArrayTemp.push(step)
    })
    this.fixedRentIntervalUsedDatesArrayTemp.splice(i, 1)
    console.log(this.fixedRentIntervalUsedDatesArrayTemp)
  }


  // Fixed Rent Indexation steps

  fixedRentIndexationStepOpen() {
    if (this.fixedRentIndexationStepArray.value.length == 0) {
      this.setNewFixedRentIndexationStepFormLine()
    }
    if (this.fixedRentIndexationStepArray.value.length > 0
      && this.fixedRentIndexationStepArray.value.length != this.fixedRentIndexationStepFormLines.length
    ) {
      this.fixedRentIndexationStepArray.value.forEach((step)=>{
        this.fixedRentIndexationIntervalUsedDatesArray.value.push({
          startDate: step.start_date,
          expirationDate: step.expiration_date
        })
        this.populateFixedRentIndexationStepForm(step)
      })
    }
    this.initializeSubscriptions()
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = false
    dialogConfig.autoFocus = true
    dialogConfig.width = '1000px'
    dialogConfig.maxHeight = '90%'
    this.dialog.open(FixedRentIndexationStepComponent, dialogConfig)
  }

  setNewFixedRentIndexationStepFormLine() {
    const stepObject = {} as FixedRentIndexationStepModel
    this.fixedRentIndexationStepArray.value.push(stepObject)
    this.fixedRentIndexationStepFormLines.push(
      this.fb.group({
        id: new FormControl(''),
        rent_contract_id: new FormControl(''),
        rent_contract_additional_agreement_id: new FormControl(''),
        start_date: new FormControl('', Validators.required),
        expiration_date: new FormControl('', Validators.required),
        fixed_rent_amount: new FormControl('',
          [Validators.required, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")]),
        fixed_rent_calculation_period: new FormControl(''),
        fixed_rent_calculation_method: new FormControl(''),
        last_updated: new FormControl(''),
        user_updated: new FormControl(''),
      })
    )
    console.log('New fixed Rent line is added')
    return this.fixedRentIndexationStepFormLines
  }

  populateFixedRentIndexationStepForm(step: FixedRentIndexationStepModel) {
    this.fixedRentIndexationStepFormLines.push(
      this.fb.group({
        id: new FormControl(step.id),
        rent_contract_id: new FormControl(step.rent_contract_id),
        rent_contract_additional_agreement_id: new FormControl(step.rent_contract_additional_agreement_id),
        start_date: new FormControl(step.start_date, Validators.required),
        expiration_date: new FormControl(step.expiration_date, Validators.required),
        fixed_rent_indexation_amount: new FormControl(step.fixed_rent_indexation_amount,
          [Validators.required, Validators.pattern("^[0-9]{1,6}(\.[0-9]{1,2})?$")]),
        fixed_rent_indexation_calculation_period: new FormControl(step.fixed_rent_indexation_calculation_period),
        last_updated: new FormControl(step.last_updated),
        user_updated: new FormControl(step.user_updated),
      })
    )
    console.log('Fixed Rent line is populated')
    return this.fixedRentIndexationStepFormLines
  }

  deleteFixedRentIndexationStepLine(i: number, step: FixedRentIndexationStepModel) {
    this.fixedRentIndexationStepFormLines.removeAt(i)
    this.fixedRentIndexationStepArray.value.splice(i, 1)
    if (step.id) {
      console.log(step)
      this.fixedRentIndexationStepDeletedArray.value.push(step)
    }
  }

  clearFixedRentIndexationStepPaymentStartDate(event: MouseEvent, i: number) {
    event.stopPropagation();
    console.log(event)
    console.log(i)
    this.fixedRentIndexationStepFormLines.controls[i].get('start_date')?.reset('')
  }

  clearFixedRentIndexationStepPaymentExpirationDate(event: MouseEvent, i: number) {
    event.stopPropagation();
    console.log(event)
    console.log(i)
    this.fixedRentIndexationStepFormLines.controls[i].get('expiration_date')?.reset('')
  }

  // Set dates Validation interval
  setFixedRentIndexationIntervalUsedDatesArrayTemp(event: MouseEvent, i: number){
    this.fixedRentIndexationIntervalUsedDatesArrayTemp = []
    this.fixedRentIndexationIntervalUsedDatesArray.value.forEach(step =>{
      this.fixedRentIndexationIntervalUsedDatesArrayTemp.push(step)
    })
    this.fixedRentIndexationIntervalUsedDatesArrayTemp.splice(i, 1)
    console.log(this.fixedRentIndexationIntervalUsedDatesArrayTemp)
  }



  initializeSubscriptions() {
    this.formDisablingSubscription = this.globalService.editCardTrigger$.subscribe(
      data => {
        if (!data) {
          this.fixedRentStepForm.disable({emitEvent: false})
        }
        if (data) {
          this.fixedRentStepForm.enable({emitEvent: false})
        }})

    this.formChangesSubscription = this.fixedRentStepFormLines.valueChanges.subscribe(
      data => {
        this.fixedRentIntervalUsedDatesArray.next([])
        // @ts-ignore
        data.forEach((step, index) => {
          this.fixedRentIntervalUsedDatesArray.value.push({
            startDate: new Date(step.start_date),
            expirationDate: new Date(step.expiration_date)
          })
        })
        console.log(this.fixedRentIntervalUsedDatesArray.value)
      })
  }



  stepsLoader(array: any[]){
    array.forEach((step)=>{
        step.start_date = this.dateCorrectHours.transform(new Date(step.start_date))
        step.expiration_date = this.dateCorrectHours.transform(new Date(step.expiration_date))
      }
    )
     return this.arraySortPipe.transform(array, 'start_date', 'Date')
  }

  populateAvailableDatesIntervalArray(premise_IdsArray: number[]){

  }

  cancelSubscriptions(){
    // this.formDisablingSubscription.unsubscribe()
    // this.formDisablingSubscription.unsubscribe()
  }
}


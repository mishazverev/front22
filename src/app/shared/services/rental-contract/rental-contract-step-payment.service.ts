import { Injectable } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../api.service";
import {GlobalAppService} from "../global-app.service";
import {EnumService} from "../enum.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {BehaviorSubject, Subscription} from "rxjs";
import {
  DatesInterval,
  FixedRentIndexationStepModel,
  FixedRentStepModel, PeriodicalFeeIndexationStepModel, PeriodicalFeeStepModel,
  TurnoverFeeStepModel
} from "../../../models/models";
import {DateTransformCorrectHoursPipe} from "../../pipes/date-transform-correct-hours.pipe";
import {DatePipe} from "@angular/common";
import {ArraySortPipe} from "../../pipes/array-sort.pipe";
import {
  FixedRentStepComponent
} from "../../../contracts/rental-contracts/rental-contracts-form/step-payments/fixed-rent-step/fixed-rent-step.component";


@Injectable({
  providedIn: 'root'
})
  export class RentalContractStepPaymentService {

  // Validation variables
  public rentContractRentStartDateActual: Date = new Date()
  public rentContractStopBillingDateActualDate: Date = new Date()

  public formFixedRentChangesSubscription: Subscription = new Subscription;
  public formFixedRentIndexationChangesSubscription: Subscription = new Subscription;
  public formTurnoverFeeChangesSubscription: Subscription = new Subscription;

  public formFixedRentDisablingSubscription: Subscription = new Subscription;
  public formFixedRentIndexationDisablingSubscription: Subscription = new Subscription;
  public formTurnoverFeeDisablingSubscription: Subscription = new Subscription;


  //Fixed rent steps
  public fixedRentStepArray = new BehaviorSubject<FixedRentStepModel[]>([])// Step array
  public fixedRentStepDeletedArray = new BehaviorSubject<FixedRentStepModel[]>([])// deleted steps to remove from DB
  public fixedRentIntervalUsedDatesArray = new BehaviorSubject<DatesInterval[]>([]) // All steps intervals
  public fixedRentIntervalUsedDatesArrayTemp: DatesInterval[] = []//  Step intervals except edited one, called at the moment of edit date

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
    this.initializeFixedRentSubscriptions()
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


  initializeFixedRentSubscriptions() {
    this.formFixedRentDisablingSubscription = this.globalService.editCardTrigger$.subscribe(
      data => {
        if (!data) {
          this.fixedRentStepForm.disable({emitEvent: false})
        }
        if (data) {
          this.fixedRentStepForm.enable({emitEvent: false})
        }})

    this.formFixedRentChangesSubscription = this.fixedRentStepFormLines.valueChanges.subscribe(
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


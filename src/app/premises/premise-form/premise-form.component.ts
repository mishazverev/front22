import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Validator} from "@angular/forms";
import {ValidationErrors} from "@angular/forms";
import {PremiseModel} from "../../models/models";
import {ApiService} from "../../shared/services/api.service";
import {DatePipe} from "@angular/common";
import {MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../shared/notification.service";
import {PremiseService} from "../../shared/services/premise.service";
import {Observable, Subscription} from "rxjs";
import {StepperOrientation} from "@angular/material/stepper";
import {map} from "rxjs/operators";
import {BreakpointObserver} from "@angular/cdk/layout";
import {GlobalAppService} from "../../shared/services/global-app.service";


@Component({
  selector: 'app-premise-form',
  templateUrl: './premise-form.component.html',
  styleUrls: ['./premise-form.component.sass']
})
export class PremiseFormComponent implements OnInit, OnDestroy {

  constructor(
    private _formBuilder: FormBuilder,
    public service: PremiseService,
    public apiService: ApiService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<PremiseFormComponent>,
    private notificationService: NotificationService,
    public globalService: GlobalAppService,
  ) {}
  public premiseTypeSubscription$: Subscription = new Subscription;
  selected = 'Торговое помещение'

  ngOnInit() {
    this.globalService.editCardTrigger$.subscribe(
      data => {
        if (data) {
          this.service.form_premises.enable()
        } else {
          this.service.form_premises.disable()
        }
      }
    )

    this.premiseTypeSubscription$ = this.service.form_premises.controls['premise_type'].valueChanges.subscribe(
      data => {
        if (data == 'retail_premise'){
          this.service.form_premises.controls['facade_length'].enable()
          this.service.form_premises.controls['electric_capacity'].enable()
          this.service.form_premises.controls['cooling_capacity'].enable()
        }
        if (data == 'warehouse_premise'){
          this.service.form_premises.controls['facade_length'].disable()
          this.service.form_premises.controls['facade_length'].reset()
          this.service.form_premises.controls['electric_capacity'].enable()
          this.service.form_premises.controls['cooling_capacity'].disable()
          this.service.form_premises.controls['cooling_capacity'].reset()
        }
        if (data == 'office_premise'){
          this.service.form_premises.controls['facade_length'].disable()
          this.service.form_premises.controls['facade_length'].reset()
          this.service.form_premises.controls['electric_capacity'].disable()
          this.service.form_premises.controls['electric_capacity'].reset()
          this.service.form_premises.controls['cooling_capacity'].disable()
          this.service.form_premises.controls['cooling_capacity'].reset()
        }
      })
  }


  onSubmit() {

    const data: PremiseModel = this.service.form_premises.value

    const measurement_date = this.datepipe.transform(data.measurement_date, 'YYYY-MM-dd')
    // @ts-ignore
    data.measurement_date = measurement_date
    data.last_updated = new Date()
    if (data.id)
    {
      this.apiService.updatePremise(this.service.form_premises.value.id, data)
        .subscribe(data => {
            // @ts-ignore
            this.service.updateTableRow(data)
          }
        )
      this.service.form_premises.reset();
      this.service.initializeFormGroup();
      this.notificationService.success('Помещение успешно обновлено');
      this.dialogRef.close()

    } else {
      console.log(data)
      this.apiService.createPremise(data)
        .subscribe(data => {
            console.log(data)
            // @ts-ignore
            this.service.newTableRow(data)
          }
        )
      this.service.form_premises.reset();
      this.service.initializeFormGroup();
      this.notificationService.success('Помещение успешно добавлено');
      this.dialogRef.close()
    }
  }

  onClear() {
    this.service.form_premises.reset();
    this.service.initializeFormGroup()
  }

  // Form clear at updating block, keeping id, number and premise type
  onClear_id: number = 0
  onClear_number: string = ''
  onClear_premise_type: string = ''

  onClearUpdated1(id:number, number:string, premise_type: '') {
    this.onClear_id = id
    this.onClear_number = number
    this.onClear_premise_type = premise_type
  }

  onClearUpdated2() {
    console.log(this.onClear_number)
    this.service.form_premises.reset();
    this.service.form_premises.setValue({
      id: this.onClear_id,
      number: this.onClear_number,
      premise_type: this.onClear_premise_type,
      floor: '',
      measured_area: '',
      measurement_date: '',
      contracted: false,
      description: '',
      last_updated: '',
      user_updated: '',
      ceiling_height: '',
      facade_length: '',
      fitout_condition: false,
      electric_capacity: '',
      cooling_capacity: '',
      water_supply: false,
    })
  }

  onClose(){
    this.service.form_premises.reset();
    this.service.initializeFormGroup()
    this.dialogRef.close()
  }

  ngOnDestroy() {
    this.premiseTypeSubscription$.unsubscribe()
  }
}

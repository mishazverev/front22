import {Injectable} from "@angular/core";
import {Form, FormControl, FormGroup, Validators, FormBuilder, AbstractControl} from "@angular/forms";
import {PremiseModel, PremiseModelStep1, PremiseModelStep2} from "../../models/models";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class PremisestepperService {

  // @ts-ignore
  private rowCreate$ = new BehaviorSubject<PremiseModel>([])
  newRow$ = this.rowCreate$.asObservable()
  // @ts-ignore
  private rowUpdate$ = new BehaviorSubject<PremiseModel>([])
  updateRow$ = this.rowUpdate$.asObservable()

  constructor(
    )
  {}

  form_step_1: FormGroup = new FormGroup({
    id: new FormControl(null),
    number: new FormControl('', Validators.required),
    premise_type: new FormControl('', Validators.required),

    floor: new FormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern("^[0-9]*$")]),
    measured_area: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{0,6}(\.[0-9]{0,2})?$")]),
    measurement_date: new FormControl(''),
    contracted: new FormControl(false),
    description: new FormControl(''),

    last_updated: new FormControl(''),
    user_updated: new FormControl(''),

  });

  form_step_2: FormGroup = new FormGroup({
    ceiling_height: new FormControl('', [Validators.pattern("^[0-9]{0,6}(\.[0-9]{0,2})?$")]),
    facade_length: new FormControl('', [Validators.pattern("^[0-9]{0,6}(\.[0-9]{0,2})?$")]),
    fitout_condition: new FormControl(false),
    electric_capacity: new FormControl('', [Validators.pattern("^[0-9]{0,6}(\.[0-9]{0,2})?$")]),
    cooling_capacity: new FormControl('', [Validators.pattern("^[0-9]{0,6}(\.[0-9]{0,2})?$")]),
    water_supply: new FormControl(false),
  })

  initializeFormGroup(){
    this.form_step_1.setValue({
      id: '',
      number: '',
      premise_type: 'retail_premise',
      floor: '',
      measured_area: '',
      measurement_date: '',
      contracted: false,
      description: '',
      last_updated: '',
      user_updated: '',
    })
    this.form_step_2.setValue({
      ceiling_height: '',
      facade_length: '',
      fitout_condition: false,
      electric_capacity: '',
      cooling_capacity: '',
      water_supply: false,
    })
  }

  populateForm(premise: PremiseModel) {
    console.log(premise)
    this.form_step_1.setValue({
      id:premise.id,
      number:premise.number,
      premise_type: premise.premise_type,
      floor:premise.floor,
      measured_area:premise.measured_area,
      measurement_date:premise.measurement_date,
      contracted:premise.contracted,
      description:premise.description,
      last_updated:premise.last_updated,
      user_updated:premise.user_updated,

    })
    this.form_step_2.setValue({
      ceiling_height:premise.ceiling_height,
      facade_length:premise.facade_length,
      fitout_condition:premise.fitout_condition,
      electric_capacity:premise.electric_capacity,
      cooling_capacity:premise.cooling_capacity,
      water_supply:premise.water_supply,
    })
  }

  newTableRow(data: PremiseModel){
    this.rowCreate$.next(data)
  }

  updateTableRow(data: PremiseModel) {
    this.rowUpdate$.next(data)
  }

  }


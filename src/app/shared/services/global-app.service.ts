import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {BuildingSetup} from "../../models/models";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Injectable({
  providedIn: 'root'
})
export class GlobalAppService {

  //Trigger toggle enables editing
  public editCardTrigger$ = new BehaviorSubject<boolean>(false)
  public buildingId$ = new BehaviorSubject<number>(1)
  public contractSetupExists$ = new BehaviorSubject<boolean>(false)
  constructor(
  ) {
  }
  public buildingSetup: BuildingSetup[] = []

  // Card editing toggle function
  editCardToggle($event: MatSlideToggleChange){
    this.editCardTrigger$.next($event.checked)
  }
}

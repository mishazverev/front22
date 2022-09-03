import { Injectable } from '@angular/core';
import { RentalContractsService } from "../services/rental-contract/rental-contracts.service";
import {BehaviorSubject} from "rxjs";
import {DatesInterval} from "../../models/models";
import {RentalContractStepPaymentService} from "../services/rental-contract/rental-contract-step-payment.service";

@Injectable({
  providedIn: 'root'
})
export class StepPaymentValidatorService {

  constructor(
    private service: RentalContractsService,
    private stepService: RentalContractStepPaymentService
  ) {}



  fixedRentStepDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.stepService.fixedRentIntervalUsedDatesArrayTemp.length>0)
      { let i = true
        for (let interval of this.stepService.fixedRentIntervalUsedDatesArrayTemp)
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

}

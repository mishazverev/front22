import { Injectable } from '@angular/core';
import { RentalContractsService } from "../services/rental-contracts.service";
import {BehaviorSubject} from "rxjs";
import {DatesInterval} from "../../models/models";
import {StepPaymentService} from "../services/step-payment.service";

@Injectable({
  providedIn: 'root'
})
export class StepPaymentValidatorService {

  constructor(
    private service: RentalContractsService,
    private stepService: StepPaymentService
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


fixedRentIndexationStepDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.stepService.fixedRentIndexationIntervalUsedDatesArrayTemp.length>0)
      { let i = true
        for (let interval of this.stepService.fixedRentIndexationIntervalUsedDatesArrayTemp)
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

turnoverFeeStepDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.stepService.turnoverFeeIntervalUsedDatesArrayTemp.length>0)
      { let i = true
        for (let interval of this.stepService.turnoverFeeIntervalUsedDatesArrayTemp)
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

periodicalFeeStepDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.stepService.periodicalFeeIntervalUsedDatesArrayTemp.length>0)
      { let i = true
        for (let interval of this.stepService.periodicalFeeIntervalUsedDatesArrayTemp)
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

  periodicalFeeIndexationStepDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true
    } else {
      if (this.stepService.periodicalFeeIndexationIntervalUsedDatesArrayTemp.length>0)
      { let i = true
        for (let interval of this.stepService.periodicalFeeIndexationIntervalUsedDatesArrayTemp)
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

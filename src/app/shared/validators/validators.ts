import {AbstractControl, ValidatorFn} from "@angular/forms";
import {Injector} from "@angular/core";
import {RentalContractsService} from "../services/rental-contract/rental-contracts.service";

export function inputValidatorInArray(val: Array<string>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
      console.log(val)
    if (
      control.value !== null && val.includes(control.value)
    ) {
      return { inputValidator: true };
    }
    return null;
  };
}

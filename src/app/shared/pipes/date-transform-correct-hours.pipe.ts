import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTransformCorrectHours'
})
export class DateTransformCorrectHoursPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

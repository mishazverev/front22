import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'dateTransformCorrectHours'
})
export class DateTransformCorrectHoursPipe implements PipeTransform {

  transform(date: Date): Date {
    return new Date(new Date(date).getTime() - (1000 * 60 * 60 * 3))  }
}

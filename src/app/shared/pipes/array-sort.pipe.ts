import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arraySort'
})
export class ArraySortPipe implements PipeTransform {

  transform(array: Array<any>, field: string, type: string): Array<any> {

    if (type == 'Date'){
      array.sort
      (function (a: any,b: any){
        return a[field].getTime() < b[field].getTime() ? -1
          : a[field].getTime() > b[field].getTime() ? 1
            : 0
      })
    }
    return array
  }


}

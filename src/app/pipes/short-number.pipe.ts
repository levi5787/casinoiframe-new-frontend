import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value < 1000) {
      return value;
    } else if (value >= 1000 && value < 100000) {
      let kValue = value / 1000;
      return Math.round(kValue * 10) / 10 + 'K';
    } else if (value >= 100000) {
      let lValue = value / 100000;
      return Math.round(lValue * 10) / 10 + 'L';
    }
  }
  
}

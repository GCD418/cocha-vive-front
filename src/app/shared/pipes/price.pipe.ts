import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
})
export class PricePipe implements PipeTransform {
  transform(value: number): string {

    if (value === 0) return 'Gratuito';

    return `Bs. ${(value / 100).toFixed(2)}`;
    
  }
}

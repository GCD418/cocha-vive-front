import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BuyPromotionRequest, PromotionResponseDTO } from '../../models/promotion-event.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionEventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/promotions`;

  buyPromotion(request: BuyPromotionRequest): Observable<PromotionResponseDTO> {
    return this.http.post<PromotionResponseDTO>(`${this.baseUrl}/buy`, request);
  }
}

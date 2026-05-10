import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketResponseDTO } from '../../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  getMyTickets(): Observable<TicketResponseDTO[]> {
    return this.http.get<TicketResponseDTO[]>(this.baseUrl);
  }
}

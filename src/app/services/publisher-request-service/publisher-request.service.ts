import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublisherRequest } from '../../models/publisher-request.model';

@Injectable({
  providedIn: 'root',
})
export class PublisherRequestService {
  private baseUrl = `${environment.apiUrl}/publisher-requests`;

  constructor(private httpClient: HttpClient) {}

  getPendingRequests(): Observable<PublisherRequest[]> {
    return this.httpClient.get<PublisherRequest[]>(`${this.baseUrl}/pending`);
  }

  getAllRequests(): Observable<PublisherRequest[]> {
    return this.httpClient.get<PublisherRequest[]>(`${this.baseUrl}/all`);
  }

  getRequestById(id: number): Observable<PublisherRequest> {
    return this.httpClient.get<PublisherRequest>(`${this.baseUrl}/${id}`);
  }

  approveRequest(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/reject`, {});
  }
}

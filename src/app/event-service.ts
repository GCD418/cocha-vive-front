import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from './event-model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';
  constructor(private httpClient: HttpClient) { }

  getVideogames(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}`);
  }
}

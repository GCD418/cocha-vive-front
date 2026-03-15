import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from './event-model';
import { CategoryDTO } from './event-model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';
  private categoriesUrl = 'http://localhost:8080/api/categories';
  constructor(private httpClient: HttpClient) { }

  getEvents(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}`);
  }

  getEventById(id: number): Observable<EventModel> {
    return this.httpClient.get<EventModel>(`${this.baseUrl}/${id}`);
  }

  createEvent(event: any, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));
    files.forEach(file => formData.append('images', file));
    return this.httpClient.post(`${this.baseUrl}`, formData);
  }

  getCategories(): Observable<CategoryDTO[]> {
  return this.httpClient.get<CategoryDTO[]>(`${this.categoriesUrl}`);
  }

  getUpcomingEvents(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}/upcoming`);
  }

  getFeaturedEvents(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}/featured`);
  }
}

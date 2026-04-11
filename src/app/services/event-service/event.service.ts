import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from '../../models/event-model';
import { CategoryDTO } from '../../models/event-model';

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

  getMyEvents(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}/my-events`);
  }

  getAllEventsForAdmin(): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}/admin/all`);
  }

  getEventById(id: number): Observable<EventModel> {
    return this.httpClient.get<EventModel>(`${this.baseUrl}/${id}`);
  }

  createEvent(event: any, files: File[]): Observable<any> {
  const formData = new FormData();

  formData.append('event', new Blob(
    [JSON.stringify(event)],
    { type: 'application/json' }
  ));

  files.forEach(file => {
    formData.append('images', file);
  });
  return this.httpClient.post(`${this.baseUrl}`, formData);
}

  updateEvent(id: number, event: any, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));
    files.forEach(file => formData.append('images', file));
    return this.httpClient.put(`${this.baseUrl}/${id}`, formData);
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
  
  getEventsByCategory(categoryId: number): Observable<EventModel[]> {
    return this.httpClient.get<EventModel[]>(`${this.baseUrl}/category/${categoryId}`);
  }
  
  cancelEvent(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }

  approveEvent(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectEvent(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${id}/reject`, {});
  }
}

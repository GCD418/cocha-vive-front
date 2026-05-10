import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleManagedUser } from '../../models/role-management.model';

export interface PublisherDemotionPayload {
  demotionReason: string;
}
export interface RoleManagementLists {
  admins: RoleManagedUser[];
  eligibleUsers: RoleManagedUser[];
  publishers: RoleManagedUser[];
}

@Injectable({
  providedIn: 'root',
})
export class RoleManagementService {
  private baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private httpClient: HttpClient) {}

  getCurrentAdmins(): Observable<RoleManagedUser[]> {
    return this.getAllUsers().pipe(
      map((users) => users.filter((user) => user.role === 'ROLE_ADMIN'))
    );
  }

  getEligibleUsers(): Observable<RoleManagedUser[]> {
    return this.getAllUsers().pipe(
      map((users) => users.filter((user) => user.role === 'ROLE_USER'))
    );
  }

  getCurrentPublishers(): Observable<RoleManagedUser[]> {
    return this.getAllUsers().pipe(
      map((users) => users.filter((user) => user.role === 'ROLE_PUBLISHER'))
    );
  }

  getRoleManagementLists(): Observable<RoleManagementLists> {
    return this.getAllUsers().pipe(
      map((users) => ({
        admins: users.filter((user) => user.role === 'ROLE_ADMIN'),
        eligibleUsers: users.filter((user) => user.role === 'ROLE_USER'),
        publishers: users.filter((user) => user.role === 'ROLE_PUBLISHER'),
      }))
    );
  }

  promoteToAdmin(userId: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${userId}/promote`, null);
  }

  demoteToUser(userId: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/${userId}/demote`, null);
  }

  demotePublisher(userId: number, payload: PublisherDemotionPayload): Observable<void> {
    return this.httpClient.patch<void>(
      `${this.baseUrl}/${userId}/demote-publisher`,
      payload
    );
  }

  private getAllUsers(): Observable<RoleManagedUser[]> {
    return this.httpClient.get<RoleManagedUser[]>(this.baseUrl);
  }
}

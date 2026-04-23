import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleManagedUser } from '../../models/role-management.model';

@Injectable({
  providedIn: 'root',
})
export class RoleManagementService {
  private baseUrl = `${environment.apiUrl}/admin/roles`;

  constructor(private httpClient: HttpClient) {}

  getCurrentAdmins(): Observable<RoleManagedUser[]> {
    return this.httpClient.get<RoleManagedUser[]>(`${this.baseUrl}/admins`);
  }

  getEligibleUsers(): Observable<RoleManagedUser[]> {
    return this.httpClient.get<RoleManagedUser[]>(`${this.baseUrl}/eligible-users`);
  }

  promoteToAdmin(userId: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/users/${userId}/promote-admin`, {});
  }

  demoteToUser(userId: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/users/${userId}/demote-user`, {});
  }
}

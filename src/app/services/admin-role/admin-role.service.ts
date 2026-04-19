import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserModel, RoleChangeResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminRoleService {
  private baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.baseUrl);
  }

  promoteToAdmin(userId: number): Observable<RoleChangeResponse> {
    return this.http.patch<RoleChangeResponse>(
      `${this.baseUrl}/${userId}/promote`, {}
    );
  }

  demoteToUser(userId: number): Observable<RoleChangeResponse> {
    return this.http.patch<RoleChangeResponse>(
      `${this.baseUrl}/${userId}/demote`, {}
    );
  }
}

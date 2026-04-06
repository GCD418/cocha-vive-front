import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthResponse {
  internalToken: string;
  requiresOnboarding: boolean;
}

export interface CurrentUser {
  id: number;
  names: string;
  firstLastName: string;
  secondLastName?: string;
  email: string;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/google`;
  private usersUrl = `${environment.apiUrl}/users`;

  verifyGoogleToken(googleToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { token: googleToken }).pipe(
      tap((response) => {
        localStorage.setItem('cocha_vive_token', response.internalToken);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('cocha_vive_token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decodedPayload = this.getDecodedPayload(token);
      const exp = decodedPayload.exp * 1000;
      const currentTime = Date.now();
      if (currentTime > exp) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
      return false;
    }
  }

  getDecodedPayload(token: string): any | null {
    try {
      const payloadBase64 = token.split('.')[1];
      return JSON.parse(atob(payloadBase64));
    } catch (error) {
      return null;
    }
  }

  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      const decodedPayload = this.getDecodedPayload(token);
      const roles: any[] = decodedPayload.roles;
      if (Array.isArray(roles) && roles.length > 0) {
        return roles[0].authority;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getCurrentUser(): Observable<CurrentUser | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    return this.http.get<CurrentUser>(`${this.usersUrl}/me`).pipe(
      catchError(() => of(null))
    );
  }

  logout(): void {
    localStorage.removeItem('cocha_vive_token');
  }
  updateOnboarding(data: { documentNumber: string; documentExtension: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/complete-profile`, data);
  }
}

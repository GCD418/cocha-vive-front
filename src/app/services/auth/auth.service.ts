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
    return !!this.getToken();
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

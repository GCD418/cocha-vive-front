import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  internalToken: string;
  requiresOnboarding: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/google`;

  verifyGoogleToken(googleToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { token: googleToken }).pipe(
      tap((response) => {
        localStorage.setItem('cocha_vive_token', response.internalToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cocha_vive_token');
  }
}

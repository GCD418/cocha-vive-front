import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
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

type JwtRole = { authority?: string };

export interface JwtPayload {
  exp?: number;
  roles?: JwtRole[] | string[];
  requiresOnboarding?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/google`;
  private usersUrl = `${environment.apiUrl}/users`;
  private readonly tokenKey = 'cocha_vive_token';
  actualRole = signal<string | null>(null);
  isAuthenticated = computed(() => this.actualRole() !== null && this.getToken() !== null);

  initAuthFromStorage(): void {
    const token = this.getToken();

    if (!token) {
      this.clearSession();
      return;
    }

    const payload = this.getDecodedPayload(token);
    if (!payload?.exp || Date.now() > payload.exp * 1000) {
      this.clearSession();
      return;
    }

    this.actualRole.set(this.extractPrimaryRole(payload));
  }

  verifyGoogleToken(googleToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { token: googleToken }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.internalToken);
        this.initAuthFromStorage();
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const payload = this.getDecodedPayload(this.getToken());
    if (!payload?.exp) {
      return false;
    }

    const exp = payload.exp * 1000;
    if (Date.now() > exp) {
      this.logout();
      return false;
    }

    return true;
  }

  getDecodedPayload(token: string | null): JwtPayload | null {
    if (!token) {
      return null;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        return null;
      }

      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
      return JSON.parse(atob(normalized + padding)) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  getRoleFromToken(): string | null {
    return this.extractPrimaryRole(this.getDecodedPayload(this.getToken()));
  }

  getRequiresOnboardingFromToken(): boolean {
    return Boolean(this.getDecodedPayload(this.getToken())?.requiresOnboarding);
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
    this.clearSession();
  }

  updateOnboarding(data: { documentNumber: string; documentExtension: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/complete-profile`, data);
  }

  private extractPrimaryRole(payload: JwtPayload | null): string | null {
    if (!payload || !Array.isArray(payload.roles) || payload.roles.length === 0) {
      return null;
    }

    const firstRole = payload.roles[0];
    if (typeof firstRole === 'string') {
      return firstRole;
    }

    if (firstRole && typeof firstRole === 'object' && typeof firstRole.authority === 'string') {
      return firstRole.authority;
    }

    return null;
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.actualRole.set(null);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface TokenDto {
  token: string;
}

export interface FacebookAuthResponse {
  status: string;
  internalToken?: string;
  requiresOnboarding?: boolean;
  registrationToken?: string;
  facebookName?: string;
  facebookPhotoUrl?: string;
}

export interface RegisterEmailRequest {
  registrationToken: string;
  email: string;
}

export interface AuthResponse {
  internalToken: string;
  requiresOnboarding: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FacebookAuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/facebook`;

  loginWithFacebook(token: string): Observable<FacebookAuthResponse> {
    return this.http.post<FacebookAuthResponse>(this.apiUrl, { token });
  }

  registerEmail(registrationToken: string, email: string): Observable<void> {
    const payload: RegisterEmailRequest = { registrationToken, email };
    return this.http.post<void>(`${this.apiUrl}/register-email`, payload);
  }

  verifyEmail(verificationToken: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verify-email`, {
      params: { token: verificationToken }
    });
  }
}

import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FacebookAuthService } from '../../../services/auth/facebook-auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../../models/app-features';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

declare global {
  interface Window {
    FB: any;
  }
}
@Component({
  selector: 'app-login-modal',
  imports: [GoogleSigninButtonModule, TranslateModule, CommonModule, FocusTrapDirective],
  templateUrl: './login-modal.html',
  styleUrls: ['./login-modal.css']
})
export class LoginModalComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private facebookAuthService = inject(FacebookAuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  public featureService = inject(FeatureToggleService);
  public readonly AppFeatures = AppFeatures;

  @Output() closeModal = new EventEmitter<void>();

  @Output() pendingEmailRegistration = new EventEmitter<{
    registrationToken: string;
    facebookName: string;
    facebookPhotoUrl: string;
  }>();
 
  isLoading = signal(false);

  ngOnInit(): void {
    this.setupGoogleAuth();
    this.initializeFacebook();
  }

  private setupGoogleAuth(): void {
    this.socialAuthService.authState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((googleUser) => {
        if (googleUser?.idToken) {
          this.authService.verifyGoogleToken(googleUser.idToken).subscribe({
            next: (response) => {
              this.close();
              this.navigateAfterLogin(response.requiresOnboarding);
            },
            error: (err) => console.error('Google login error', err),
          });
        }
      });
  }

  private initializeFacebook(): void {
    if (window.FB) {
      window.FB.init({
        appId: this.getFacebookAppId(),
        xfbml: true,
        version: 'v18.0'
      });
    }
  }

  loginWithFacebook(): void {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      alert('Facebook SDK not loaded. Please refresh the page.');
      return;
    }

    this.isLoading.set(true);

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        this.verifyFacebookToken(accessToken);
      } else {
        this.isLoading.set(false);
      }
    }, { scope: 'public_profile,email' });
  }

  private verifyFacebookToken(token: string): void {

    this.facebookAuthService.loginWithFacebook(token).subscribe({
      next: (response) => {
        if (response.status === 'AUTHENTICATED') {
          localStorage.setItem('cocha_vive_token', response.internalToken!);
          this.authService.initAuthFromStorage();
          this.close();
          this.navigateAfterLogin(response.requiresOnboarding ?? false);
        } else if (response.status === 'PENDING_EMAIL_REGISTRATION') {
            this.pendingEmailRegistration.emit({
            registrationToken: response.registrationToken!,
            facebookName: response.facebookName ?? '',
            facebookPhotoUrl: response.facebookPhotoUrl ?? '',
          });
          this.close();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Facebook verification error', err);
        this.isLoading.set(false);
        alert('Facebook login failed. Please try again.');
      }
    });
  }

  private navigateAfterLogin(requiresOnboarding: boolean): void {
    if (requiresOnboarding) {
      this.router.navigate(['/onboarding']);
      return;
    }
 
    const returnUrl = this.getReturnUrl();
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
 
    const role = this.authService.getRoleFromToken();
    if (role === 'ROLE_PUBLISHER') {
      this.router.navigate(['/publisher/my-events']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  private getReturnUrl(): string | null {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const returnUrl = queryParams['returnUrl'];
    if (typeof returnUrl === 'string' && returnUrl.startsWith('/')) {
      return returnUrl;
    }
    return null;
  }

  close() {
    this.closeModal.emit();
  }

  private getFacebookAppId(): string {
    return '1287398529508090';
  }
}
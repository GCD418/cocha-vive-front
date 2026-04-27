import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FacebookAuthService } from '../../../services/auth/facebook-auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmailRegistrationModal } from '../email-registration-modal/email-registration-modal';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    FB: any;
  }
}
@Component({
  selector: 'app-login-modal',
  imports: [GoogleSigninButtonModule, TranslateModule,  EmailRegistrationModal, CommonModule],
  templateUrl: './login-modal.html',
  styleUrls: ['./login-modal.css']
})
export class LoginModalComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private facebookAuthService = inject(FacebookAuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @Output() closeModal = new EventEmitter<void>();

  showEmailModal = signal(false);
  isLoading = signal(false);
  registrationToken = signal<string | null>(null);
  facebookName = signal('');
  facebookPhotoUrl = signal('');

  ngOnInit(): void {
    this.setupGoogleAuth();
    this.initializeFacebook();
  }

  private setupGoogleAuth(): void {
    this.socialAuthService.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((googleUser) => {
      if (googleUser && googleUser.idToken) {
        this.authService.verifyGoogleToken(googleUser.idToken).subscribe({
          next: (response) => {
            this.close(); 
            if (response.requiresOnboarding) {
              this.router.navigate(['/onboarding']);
              return;
            } 

            const returnUrl = this.getReturnUrl();
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
              return;
            }
            
            const userRole = this.authService.getRoleFromToken();
            switch (userRole) {
              case 'ROLE_PUBLISHER':
                this.router.navigate(['/publisher/my-events']);
                break;
              
              case 'ROLE_USER':
                this.router.navigate(['/home']);
                break;
              
              default:
                this.router.navigate(['/home']);
                break;
            }
          },
          error: (err) => {
            console.error('Error al iniciar sesión con Google', err);
          },
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
      return;
    }

    this.isLoading.set(true);

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        this.verifyFacebookToken(accessToken);
      } else {
        this.isLoading.set(false);
        console.error('Facebook login failed');
      }
    }, { scope: 'public_profile,email' });
  }

  private verifyFacebookToken(token: string): void {
    this.facebookAuthService.loginWithFacebook(token).subscribe({
      next: (response) => {
        if (response.status === 'AUTHENTICATED') {
          this.handleLoginSuccess(response.requiresOnboarding || false);
        } else if (response.status === 'PENDING_EMAIL_REGISTRATION') {
          this.registrationToken.set(response.registrationToken || null);
          this.facebookName.set(response.facebookName || '');
          this.facebookPhotoUrl.set(response.facebookPhotoUrl || '');
          this.showEmailModal.set(true);
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

  onEmailSubmit(email: string): void {
    const token = this.registrationToken();
    if (!token) return;

    this.isLoading.set(true);

    this.facebookAuthService.registerEmail(token, email).subscribe({
      next: () => {
        alert(`Verification email sent to ${email}. Please check your inbox.`);
        this.showEmailModal.set(false);
        this.close();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Email registration error', err);
        alert('Failed to register email. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private handleLoginSuccess(requiresOnboarding: boolean): void {
    this.close();

    if (requiresOnboarding) {
      this.router.navigate(['/onboarding']);
      return;
    }

    const returnUrl = this.getReturnUrl();
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    const userRole = this.authService.getRoleFromToken();
    switch (userRole) {
      case 'ROLE_PUBLISHER':
        this.router.navigate(['/publisher/my-events']);
        break;
      case 'ROLE_USER':
        this.router.navigate(['/home']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }

  close() {
    this.closeModal.emit();
  }

  private getReturnUrl(): string | null {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const returnUrl = queryParams['returnUrl'];

    if (typeof returnUrl === 'string' && returnUrl.startsWith('/')) {
      return returnUrl;
    }

    return null;
  }

  private getFacebookAppId(): string {
    return '1287398529508090';
  }
}
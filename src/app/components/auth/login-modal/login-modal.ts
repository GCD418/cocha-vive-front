import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FeatureToggleService } from '../../../services/feature-toggle/feature-toggle.service';
import { AppFeatures } from '../../../models/app-features';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

@Component({
  selector: 'app-login-modal',
  imports: [GoogleSigninButtonModule, TranslateModule, CommonModule, FocusTrapDirective],
  templateUrl: './login-modal.html',
  styleUrls: ['./login-modal.css']
})
export class LoginModalComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  public featureService = inject(FeatureToggleService);
  public readonly AppFeatures = AppFeatures;

  @Output() closeModal = new EventEmitter<void>();

  isLoading = signal(false);

  ngOnInit(): void {
    this.setupGoogleAuth();
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

}
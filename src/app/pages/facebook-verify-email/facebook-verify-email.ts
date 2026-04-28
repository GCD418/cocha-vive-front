import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacebookAuthService } from '../../services/auth/facebook-auth.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-facebook-verify-email',
  imports: [CommonModule, TranslateModule],
  templateUrl: './facebook-verify-email.html',
  styleUrl: './facebook-verify-email.css',
})
export class FacebookVerifyEmail {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private facebookAuthService = inject(FacebookAuthService);
  private authService = inject(AuthService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.errorMessage.set('AUTH.FACEBOOK_VERIFY.ERROR_NO_TOKEN');
      return;
    }

    this.facebookAuthService.verifyEmail(token).subscribe({
      next: (response) => {
        console.log('Response received:', response); //debug
        console.log('Token:', response.internalToken); //debug
        localStorage.setItem('cocha_vive_token', response.internalToken);

        console.log('Token saved:', localStorage.getItem('cocha_vive_token')); //debug
        this.authService.initAuthFromStorage();
        this.status.set('success');

        setTimeout(() => {
          if (response.requiresOnboarding) {
            window.location.replace('/onboarding');
          } else {
            window.location.href = '/home';
          }
        }, 2000);
      },
      error: (err) => {
        this.status.set('error');
        this.errorMessage.set('AUTH.FACEBOOK_VERIFY.ERROR_INVALID');
        console.error('Email verification error:', err);
      }
    });
  }
}

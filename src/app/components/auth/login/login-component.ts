import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [GoogleSigninButtonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((googleUser) => {
      if (googleUser && googleUser.idToken) {
        this.authService.verifyGoogleToken(googleUser.idToken).subscribe({
          next: (response) => {
            if (response.requiresOnboarding) {
              this.router.navigate(['/onboarding']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            console.error('Login failed', err);
          },
        });
      }
    });
  }
}

import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [GoogleSigninButtonModule, TranslateModule],
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
              return;
            } 
            
            const userRole = this.authService.getRoleFromToken();
            switch (userRole) {
              case 'ROLE_PUBLISHER':
                this.router.navigate(['/events']);
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
            console.error('Login failed', err);
          },
        });
      }
    });
  }
}

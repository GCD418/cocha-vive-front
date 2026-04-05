import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [GoogleSigninButtonModule, TranslateModule],
  templateUrl: './login-modal.html',
  styleUrls: ['./login-modal.css']
})
export class LoginModalComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() closeModal = new EventEmitter<void>();

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((googleUser) => {
      if (googleUser && googleUser.idToken) {
        this.authService.verifyGoogleToken(googleUser.idToken).subscribe({
          next: (response) => {
            this.close(); 
            if (response.requiresOnboarding) {
              this.router.navigate(['/onboarding']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            console.error('Error al iniciar sesión con Google', err);
          },
        });
      }
    });
  }

  close() {
    this.closeModal.emit();
  }
}
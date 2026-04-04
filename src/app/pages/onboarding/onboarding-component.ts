import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './onboarding-component.html',
  styleUrls: ['./onboarding-component.css']
})
export class OnboardingComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSuccess: boolean = false;
  isError: boolean = false;

  onboardingData = {
    documentNumber: '', 
    documentExtension: ''       
  };

  onSubmit() {
    this.isError = false;
    const payload = {
      documentNumber: this.onboardingData.documentNumber.trim(),
      documentExtension: this.onboardingData.documentExtension?.trim() || ''
    };

    this.authService.updateOnboarding(payload).subscribe({
      next: () => {
        this.isSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error en onboarding:', err);
        this.isError = true; 
      }
    });
  }
  retry() {
    this.isError = false;
  }
}
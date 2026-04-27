import { Component, EventEmitter, Output, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-email-registration-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './email-registration-modal.html',
  styleUrl: './email-registration-modal.css',
})
export class EmailRegistrationModal {
  @Input() facebookName: string = '';
  @Input() facebookPhotoUrl: string = '';
  @Input() isLoading: boolean = false;
  @Output() submitEmail = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  email: string = '';
  emailError: string = '';

  onSubmit() {
    this.emailError = '';
    
    if (!this.email) {
      this.emailError = 'Email is required';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.emailError = 'Invalid email format';
      return;
    }

    this.submitEmail.emit(this.email);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

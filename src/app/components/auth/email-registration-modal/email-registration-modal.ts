import { Component, EventEmitter, Output, Input, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';


@Component({
  selector: 'app-email-registration-modal',
  imports: [CommonModule, FormsModule, TranslateModule, FocusTrapDirective],
  templateUrl: './email-registration-modal.html',
  styleUrl: './email-registration-modal.css',
})
export class EmailRegistrationModal {
  private translate = inject(TranslateService);
  @Input() facebookName: string = '';
  @Input() facebookPhotoUrl: string = '';
  @Input() isLoading: boolean = false;
  @Input() serverError: string = '';
  @Output() submitEmail = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  email: string = '';
  emailError: string = '';

  onSubmit() {
    this.emailError = '';
    
    if (!this.email) {
      this.emailError = this.translate.instant('AUTH.EMAIL_ERROR_REQUIRED');
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.emailError = this.translate.instant('AUTH.EMAIL_ERROR_INVALID');
      return;
    }

    this.submitEmail.emit(this.email);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
